from rest_framework import routers
from django.urls import path, include
from .views import ScheduleViewSet, ServiceViewSet, WeekdayViewSet, WorkinghoursViewSet

router = routers.DefaultRouter()
router.register(r'schedule', ScheduleViewSet)
router.register(r'service', ServiceViewSet)
router.register(r'weekday', WeekdayViewSet)
router.register(r'workinghours', WorkinghoursViewSet)

urlpatterns = [
    path('', include(router.urls)),
]