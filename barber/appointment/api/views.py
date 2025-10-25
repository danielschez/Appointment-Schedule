# appointment/api/views.py
import requests
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.response import Response
from appointment.models import Schedule, Service, Weekday, Workinghours
from .serializers import ScheduleSerializer, ServiceSerializer, WeekdaySerializer, WorkinghoursSerializer
import logging

logger = logging.getLogger(__name__)

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

    def create(self, request, *args, **kwargs):
        captcha_token = request.data.get('captchaToken')
        if not captcha_token:
            logger.warning("POST sin captcha token")
            return Response({'error': 'Captcha token no proporcionado.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Validar token con Google reCAPTCHA
            r = requests.post('https://www.google.com/recaptcha/api/siteverify', data={
                'secret': settings.RECAPTCHA_SECRET_KEY,
                'response': captcha_token
            })
            result = r.json()
        except Exception as e:
            logger.error(f"Error al validar captcha: {e}")
            return Response({'error': 'Error al validar captcha.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not result.get('success'):
            logger.info(f"Captcha inválido: {result}")
            return Response({'error': 'Falló la verificación de reCAPTCHA.'}, status=status.HTTP_400_BAD_REQUEST)

        # Crear Schedule
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        logger.info(f"Schedule creado: {serializer.data}")
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class WeekdayViewSet(viewsets.ModelViewSet):
    queryset = Weekday.objects.all()
    serializer_class = WeekdaySerializer

class WorkinghoursViewSet(viewsets.ModelViewSet):
    queryset = Workinghours.objects.all()
    serializer_class = WorkinghoursSerializer

