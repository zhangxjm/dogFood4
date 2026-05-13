from rest_framework import serializers
from .models import Technician, Schedule


class TechnicianSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    
    class Meta:
        model = Technician
        fields = [
            'id', 'name', 'gender', 'gender_display', 'phone', 
            'position', 'skills', 'status', 'status_display',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ScheduleSerializer(serializers.ModelSerializer):
    technician_name = serializers.CharField(source='technician.name', read_only=True)
    shift_display = serializers.CharField(source='get_shift_display', read_only=True)
    technician_info = TechnicianSerializer(source='technician', read_only=True)
    
    class Meta:
        model = Schedule
        fields = [
            'id', 'technician', 'technician_name', 'technician_info',
            'date', 'shift', 'shift_display', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
