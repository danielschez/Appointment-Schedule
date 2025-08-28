# appointment/api/serializers.py
from rest_framework import serializers
from appointment.models import Schedule, Service, Weekday, Workinghours
from appointment.utils import enviar_email_confirmacion
import logging

logger = logging.getLogger(__name__)

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'
    
    def create(self, validated_data):
        # Crear la cita
        cita = Schedule.objects.create(**validated_data)
        
        # Enviar email de confirmación
        try:
            email_enviado = enviar_email_confirmacion(cita)
            if email_enviado:
                logger.info(f'Email de confirmación enviado exitosamente para cita {cita.id}')
            else:
                logger.warning(f'No se pudo enviar email para cita {cita.id}')
        except Exception as e:
            # Log el error pero no fallar la creación de la cita
            logger.error(f'Error al enviar email para cita {cita.id}: {str(e)}')
        
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