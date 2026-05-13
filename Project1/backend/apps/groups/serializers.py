from rest_framework import serializers
from .models import GroupBuy
from apps.products.serializers import ProductListSerializer
from apps.users.serializers import UserSerializer


class GroupBuyListSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    leader = UserSerializer(read_only=True)
    
    class Meta:
        model = GroupBuy
        fields = '__all__'
        read_only_fields = ['id', 'current_people', 'status', 'created_at', 'leader']


class GroupBuyDetailSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    leader = UserSerializer(read_only=True)
    
    class Meta:
        model = GroupBuy
        fields = '__all__'
        read_only_fields = ['id', 'current_people', 'status', 'created_at', 'leader']


class GroupBuyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupBuy
        fields = [
            'product', 'title', 'group_price', 'min_group_size',
            'start_time', 'end_time'
        ]
