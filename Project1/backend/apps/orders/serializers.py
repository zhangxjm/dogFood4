from rest_framework import serializers
from .models import Order, OrderItem
from apps.users.serializers import UserSerializer
from apps.pickup_points.serializers import PickupPointSimpleSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'product_image', 'price',
            'quantity', 'total_price'
        ]


class OrderListSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pickup_point = PickupPointSimpleSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_no', 'user', 'leader', 'pickup_point',
            'total_amount', 'discount_amount', 'pay_amount',
            'status', 'status_display', 'pickup_method',
            'receiver_name', 'receiver_phone', 'verification_code',
            'is_verified', 'paid_at', 'completed_at', 'created_at',
            'items'
        ]
        read_only_fields = fields


class OrderDetailSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    pickup_point = PickupPointSimpleSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = [
            'id', 'order_no', 'user', 'leader', 'total_amount',
            'discount_amount', 'pay_amount', 'status', 'transaction_id',
            'paid_at', 'completed_at', 'verification_code', 'is_verified',
            'verified_at', 'commission', 'created_at', 'updated_at', 'items'
        ]


class OrderCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)
    group_buy_id = serializers.IntegerField(required=False, allow_null=True)
    pickup_point_id = serializers.IntegerField()
    pickup_method = serializers.ChoiceField(choices=['self', 'delivery'])
    remark = serializers.CharField(required=False, allow_null=True)
    receiver_name = serializers.CharField(required=False, allow_null=True)
    receiver_phone = serializers.CharField(required=False, allow_null=True)
    receiver_address = serializers.CharField(required=False, allow_null=True)


class OrderVerifySerializer(serializers.Serializer):
    verification_code = serializers.CharField(max_length=8)


class OrderPaymentSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=['wechat', 'balance'])
