# appointment/api/serializers.py
from rest_framework import serializers
from appointment.models import Schedule, Service, Weekday, Workinghours
from appointment.utils import enviar_email_confirmacion, enviar_email_notificacion_admin
import logging

logger = logging.getLogger('appointment.api.serializers')

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'
    
    def create(self, validated_data):
        logger.info(f'📝 Creando nueva cita para {validated_data.get("name")}')
        
        # Crear la cita
        cita = Schedule.objects.create(**validated_data)
        logger.info(f'✅ Cita {cita.id} creada exitosamente')
        
        # Enviar email de confirmación al cliente
        try:
            logger.info(f'📧 Intentando enviar email de confirmación...')
            email_enviado = enviar_email_confirmacion(cita)
            if email_enviado:
                logger.info(f'✅ Email de confirmación enviado a {cita.email} para cita {cita.id}')
            else:
                logger.warning(f'⚠️ No se pudo enviar email a {cita.email} para cita {cita.id}')
        except Exception as e:
            logger.error(f'❌ Error al enviar email al cliente para cita {cita.id}: {str(e)}')
            import traceback
            logger.error(traceback.format_exc())
        
        # Enviar notificación al administrador
        try:
            logger.info(f'📧 Intentando enviar notificación al administrador...')
            notif_enviada = enviar_email_notificacion_admin(cita)
            if notif_enviada:
                logger.info(f'✅ Notificación enviada al administrador para cita {cita.id}')
        except Exception as e:
            logger.error(f'❌ Error al enviar notificación al admin para cita {cita.id}: {str(e)}')
            import traceback
            logger.error(traceback.format_exc())
        
        return cita


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