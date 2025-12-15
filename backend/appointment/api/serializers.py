# appointment/api/serializers.py
from rest_framework import serializers
from appointment.models import Schedule, Service, Weekday, Workinghours, PromoCode, Holiday
from appointment.utils import enviar_email_confirmacion, enviar_email_notificacion_admin
from django.utils import timezone
from django.core.exceptions import ValidationError as DjangoValidationError
import logging

logger = logging.getLogger('appointment.api.serializers')

class ScheduleSerializer(serializers.ModelSerializer):
    promo_code_text = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        source='promo_code_input'
    )

    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Schedule
        fields = ['id', 'date', 'time', 'name', 'email', 'phone',
                  'description', 'promo_code_allowed', 'service',
                  'promo_code', 'promo_code_text', 'created_at', 'updated_at']
        extra_kwargs = {
            'promo_code': {'read_only': True}
        }

    def validate(self, data):
        """
        Valida el código promocional y verifica que no exista cita duplicada
        """
        promo_code_input = data.pop('promo_code_input', None)

        if promo_code_input:
            try:
                promo_code = PromoCode.objects.get(
                    code__iexact=promo_code_input.strip()
                )

                if not promo_code.active:
                    raise serializers.ValidationError({
                        'promo_code': 'El código promocional no está activo.'
                    })

                if not promo_code.is_valid():
                    now = timezone.now()
                    if now < promo_code.valid_from:
                        raise serializers.ValidationError({
                            'promo_code': 'El código promocional aún no es válido.'
                        })
                    elif now > promo_code.valid_to:
                        raise serializers.ValidationError({
                            'promo_code': 'El código promocional ha expirado.'
                        })

                data['promo_code'] = promo_code
                data['promo_code_allowed'] = True

                logger.info(f'[OK] Codigo promocional valido: {promo_code.code} ({promo_code.discount_percentage}% descuento)')

            except PromoCode.DoesNotExist:
                raise serializers.ValidationError({
                    'promo_code': 'El código promocional no existe.'
                })
        else:
            data['promo_code'] = None
            data['promo_code_allowed'] = False

        date = data.get('date')
        time = data.get('time')
        
        if date and time:
            existing_appointments = Schedule.objects.filter(
                date=date,
                time=time
            )
            
            if self.instance:
                existing_appointments = existing_appointments.exclude(pk=self.instance.pk)
            
            if existing_appointments.exists():
                logger.warning(f'[DUPLICATE] Intento de crear cita duplicada para {date} a las {time}')
                
                raise serializers.ValidationError({
                    'appointment_conflict': 'Este horario ya ha sido reservado. Por favor, selecciona otro horario disponible.'
                })

        return data

    def create(self, validated_data):
        logger.info(f'[CREATE] Creando nueva cita para {validated_data.get("name")}')

        name = validated_data.pop('name')
        email = validated_data.pop('email')
        phone = validated_data.pop('phone')

        try:
            cita = Schedule(**validated_data)

            cita.name = name
            cita.email = email
            cita.phone = phone

            cita.save()

            logger.info(f'[OK] Cita {cita.id} creada exitosamente para {cita.date} a las {cita.time}')

            if cita.promo_code:
                cita.promo_code.current_uses += 1
                cita.promo_code.save()
                logger.info(f'[PROMO] Codigo {cita.promo_code.code} usado. Total usos: {cita.promo_code.current_uses}')

            try:
                logger.info(f'[EMAIL] Intentando enviar email de confirmacion...')
                email_enviado = enviar_email_confirmacion(cita)
                if email_enviado:
                    logger.info(f'[OK] Email de confirmacion enviado a {cita.email} para cita {cita.id}')
                else:
                    logger.warning(f'[WARN] No se pudo enviar email a {cita.email} para cita {cita.id}')
            except Exception as e:
                logger.error(f'[ERROR] Error al enviar email al cliente para cita {cita.id}: {str(e)}')
                import traceback
                logger.error(traceback.format_exc())

            try:
                logger.info(f'[ADMIN] Intentando enviar notificacion al administrador...')
                notif_enviada = enviar_email_notificacion_admin(cita)
                if notif_enviada:
                    logger.info(f'[OK] Notificacion enviada al administrador para cita {cita.id}')
            except Exception as e:
                logger.error(f'[ERROR] Error al enviar notificacion al admin para cita {cita.id}: {str(e)}')
                import traceback
                logger.error(traceback.format_exc())

            return cita

        except DjangoValidationError as e:
            logger.error(f'[ERROR] Error de validacion al crear cita: {str(e)}')
            
            if hasattr(e, 'message_dict'):
                friendly_errors = {}
                for field, messages in e.message_dict.items():
                    if field in ['date', 'time', '__all__'] or 'unique' in str(messages).lower() or 'conjunto único' in str(messages).lower():
                        friendly_errors['appointment_conflict'] = 'Este horario ya ha sido reservado. Por favor, selecciona otro horario disponible.'
                        break
                    else:
                        friendly_errors[field] = messages
                
                if not friendly_errors:
                    friendly_errors['appointment_conflict'] = 'Este horario ya ha sido reservado. Por favor, selecciona otro horario disponible.'
                
                raise serializers.ValidationError(friendly_errors)
            else:
                error_msg = str(e).lower()
                if 'unique' in error_msg or 'conjunto único' in error_msg or 'duplicat' in error_msg:
                    raise serializers.ValidationError({
                        'appointment_conflict': 'Este horario ya ha sido reservado. Por favor, selecciona otro horario disponible.'
                    })
                else:
                    raise serializers.ValidationError({
                        'detail': 'Error al crear la cita. Por favor, intenta nuevamente.'
                    })

    def to_representation(self, instance):
        """
        Convierte la instancia a diccionario para la respuesta
        Los properties se encargan de desencriptar automáticamente
        """
        ret = super().to_representation(instance)
        return ret


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class WeekdaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Weekday
        fields = '__all__'


class WorkinghoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workinghours
        fields = '__all__'


class HolidaySerializer(serializers.ModelSerializer):
    formatted_date = serializers.SerializerMethodField()

    class Meta:
        model = Holiday
        fields = ['id', 'name', 'date', 'recurring', 'active', 'description', 'formatted_date']
        read_only_fields = ['id', 'formatted_date']

    def get_formatted_date(self, obj):
        """Retorna la fecha formateada"""
        if obj.recurring:
            return f"{obj.date.strftime('%d de %B')} (cada año)"
        return obj.date.strftime('%d de %B de %Y')