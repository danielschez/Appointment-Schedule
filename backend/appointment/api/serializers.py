# appointment/api/serializers.py
from rest_framework import serializers
from appointment.models import Schedule, Service, Weekday, Workinghours, PromoCode
from appointment.utils import enviar_email_confirmacion, enviar_email_notificacion_admin
from django.utils import timezone
import logging

logger = logging.getLogger('appointment.api.serializers')

class ScheduleSerializer(serializers.ModelSerializer):
    promo_code_text = serializers.CharField(
        write_only=True, 
        required=False, 
        allow_blank=True,
        source='promo_code_input'
    )
    
    # Definir explícitamente los campos encriptados
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    
    class Meta:
        model = Schedule
        fields = ['id', 'date', 'time', 'name', 'email', 'phone', 
                  'description', 'promo_code_allowed', 'service', 
                  'promo_code', 'promo_code_text']
        extra_kwargs = {
            'promo_code': {'read_only': True}
        }
    
    def validate(self, data):
        """
        Valida el código promocional si fue proporcionado
        """
        promo_code_input = data.pop('promo_code_input', None)
        
        if promo_code_input:
            try:
                promo_code = PromoCode.objects.get(
                    code__iexact=promo_code_input.strip()
                )
                
                if not promo_code.active:
                    raise serializers.ValidationError({
                        'promo_code': 'El codigo promocional no esta activo.'
                    })
                
                if not promo_code.is_valid():
                    now = timezone.now()
                    if now < promo_code.valid_from:
                        raise serializers.ValidationError({
                            'promo_code': 'El codigo promocional aun no es valido.'
                        })
                    elif now > promo_code.valid_to:
                        raise serializers.ValidationError({
                            'promo_code': 'El codigo promocional ha expirado.'
                        })
                
                data['promo_code'] = promo_code
                data['promo_code_allowed'] = True
                
                logger.info(f'[OK] Codigo promocional valido: {promo_code.code} ({promo_code.discount_percentage}% descuento)')
                
            except PromoCode.DoesNotExist:
                raise serializers.ValidationError({
                    'promo_code': 'El codigo promocional no existe.'
                })
        else:
            data['promo_code'] = None
            data['promo_code_allowed'] = False
        
        return data
    
    def create(self, validated_data):
        logger.info(f'[CREATE] Creando nueva cita para {validated_data.get("name")}')
        
        # Extraer los datos
        name = validated_data.pop('name')
        email = validated_data.pop('email')
        phone = validated_data.pop('phone')
        
        # Crear el objeto
        cita = Schedule(**validated_data)
        
        # Asignar los campos encriptados
        cita.name = name
        cita.email = email
        cita.phone = phone
        
        # Guardar
        cita.save()
        
        logger.info(f'[OK] Cita {cita.id} creada exitosamente')
        
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