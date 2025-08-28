from rest_framework.routers import DefaultRouter
from .views import ScheduleViewSet, ServiceViewSet, WorkinghoursViewSet, WeekdayViewSet

router = DefaultRouter()
router.register(r'schedule', ScheduleViewSet)
router.register(r'service', ServiceViewSet)
router.register(r'workinghours', WorkinghoursViewSet)
router.register(r'weekday', WeekdayViewSet)

urlpatterns = router.urls
