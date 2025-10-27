from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/', include('appointment.api.urls')),
]