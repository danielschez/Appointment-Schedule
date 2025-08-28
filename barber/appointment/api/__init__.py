from rest_framework import serializers
from appointment.models import Schedule

class CitaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'