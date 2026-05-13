from rest_framework import serializers
from .models import PickupPoint
from apps.users.serializers import UserSerializer


class PickupPointSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    
    class Meta:
        model = PickupPoint
        fields = '__all__'
        read_only_fields = ['id', 'leader', 'created_at', 'updated_at']


class PickupPointSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PickupPoint
        fields = ['id', 'name', 'address', 'phone', 'business_hours']
