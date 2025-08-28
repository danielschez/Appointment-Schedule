# appointment/api/views.py
from rest_framework import viewsets
from appointment.models import Schedule, Service, Weekday, Workinghours
from .serializers import ScheduleSerializer, ServiceSerializer, WeekdaySerializer, WorkinghoursSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class WeekdayViewSet(viewsets.ModelViewSet):
    queryset = Weekday.objects.all()
    serializer_class = WeekdaySerializer

class WorkinghoursViewSet(viewsets.ModelViewSet):
    queryset = Workinghours.objects.all()
    serializer_class = WorkinghoursSerializer

