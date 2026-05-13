from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer, OrderDetailSerializer,
    OrderCreateSerializer, OrderVerifySerializer, OrderPaymentSerializer
)
from apps.products.models import Product
from apps.pickup_points.models import PickupPoint
from apps.groups.models import GroupBuy
from apps.users.models import LeaderProfile
from utils.order_utils import generate_order_no, generate_verification_code, calculate_commission
from utils.wechat_pay import wechat_pay
from utils.permissions import IsLeader


class OrderViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'delete']
    
    def get_permissions(self):
        if self.action in ['verify', 'leader_orders']:
            return [IsLeader()]
        return [permissions.IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'leader':
            if self.action == 'leader_orders':
                return Order.objects.filter(leader=user).select_related('user', 'leader', 'pickup_point').prefetch_related('items')
        return Order.objects.filter(user=user).select_related('leader', 'pickup_point').prefetch_related('items')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        product = Product.objects.filter(id=data['product_id']).first()
        if not product:
            return Response({'detail': '商品不存在'}, status=status.HTTP_400_BAD_REQUEST)
        
        if product.stock < data['quantity']:
            return Response({'detail': '库存不足'}, status=status.HTTP_400_BAD_REQUEST)
        
        pickup_point = PickupPoint.objects.filter(id=data['pickup_point_id']).first()
        if not pickup_point:
            return Response({'detail': '自提点不存在'}, status=status.HTTP_400_BAD_REQUEST)
        
        group_buy = None
        if data.get('group_buy_id'):
            group_buy = GroupBuy.objects.filter(id=data['group_buy_id'], status='active').first()
            if not group_buy:
                return Response({'detail': '团购活动无效'}, status=status.HTTP_400_BAD_REQUEST)
        
        price = group_buy.group_price if group_buy else product.group_price
        total_amount = price * data['quantity']
        
        try:
            leader_profile = LeaderProfile.objects.get(user=product.leader)
            commission_rate = leader_profile.commission_rate
        except LeaderProfile.DoesNotExist:
            commission_rate = 0.05
        
        order = Order.objects.create(
            order_no=generate_order_no(),
            user=request.user,
            leader=product.leader,
            pickup_point=pickup_point,
            group_buy=group_buy,
            total_amount=total_amount,
            discount_amount=0,
            pay_amount=total_amount,
            status='pending',
            pickup_method=data['pickup_method'],
            receiver_name=data.get('receiver_name'),
            receiver_phone=data.get('receiver_phone'),
            receiver_address=data.get('receiver_address'),
            remark=data.get('remark'),
            verification_code=generate_verification_code(),
            commission=calculate_commission(total_amount, commission_rate)
        )
        
        OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_image=product.image.url if product.image else None,
            price=price,
            quantity=data['quantity'],
            total_price=total_amount
        )
        
        product.stock -= data['quantity']
        product.save()
        
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        
        if order.status != 'pending':
            return Response({'detail': '订单状态无效'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = OrderPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_method = serializer.validated_data['payment_method']
        
        order.payment_method = payment_method
        order.status = 'paid'
        order.paid_at = timezone.now()
        order.save()
        
        if order.group_buy:
            order.group_buy.current_people += 1
            order.group_buy.save()
        
        product = order.items.first().product
        if product:
            product.sold_count += order.items.first().quantity
            product.save()
        
        if payment_method == 'wechat':
            pay_params = {
                'appId': 'your_appid',
                'timeStamp': str(int(timezone.now().timestamp())),
                'nonceStr': generate_verification_code(),
                'package': f'prepay_id=test_{order.order_no}',
                'signType': 'MD5',
                'paySign': 'test_signature',
            }
            return Response({
                'order': OrderDetailSerializer(order).data,
                'pay_params': pay_params,
                'message': '模拟支付成功（请在真实环境中集成微信支付）'
            })
        
        return Response({
            'order': OrderDetailSerializer(order).data,
            'message': '支付成功'
        })
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        if order.status not in ['pending']:
            return Response({'detail': '当前状态不能取消'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'cancelled'
        order.save()
        
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()
        
        return Response({'message': '订单已取消'})
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        order = self.get_object()
        
        if order.status not in ['delivered']:
            return Response({'detail': '当前状态不能确认收货'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = 'completed'
        order.completed_at = timezone.now()
        order.save()
        
        try:
            leader_profile = LeaderProfile.objects.get(user=order.leader)
            leader_profile.total_commission += order.commission
            leader_profile.save()
        except LeaderProfile.DoesNotExist:
            pass
        
        return Response({'message': '确认收货成功'})
    
    @action(detail=False, methods=['post'], permission_classes=[IsLeader])
    def verify(self, request):
        serializer = OrderVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['verification_code']
        
        try:
            order = Order.objects.get(verification_code=code, leader=request.user)
        except Order.DoesNotExist:
            return Response({'detail': '核销码无效'}, status=status.HTTP_404_NOT_FOUND)
        
        if order.is_verified:
            return Response({'detail': '订单已核销'}, status=status.HTTP_400_BAD_REQUEST)
        
        if order.status not in ['paid', 'shipped', 'delivered']:
            return Response({'detail': '订单状态不能核销'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.is_verified = True
        order.verified_at = timezone.now()
        order.status = 'completed'
        order.completed_at = timezone.now()
        order.save()
        
        try:
            leader_profile = LeaderProfile.objects.get(user=order.leader)
            leader_profile.total_commission += order.commission
            leader_profile.save()
        except LeaderProfile.DoesNotExist:
            pass
        
        return Response({
            'message': '核销成功',
            'order': OrderDetailSerializer(order).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[IsLeader])
    def leader_orders(self, request):
        queryset = self.get_queryset()
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def wechat_notify(self, request):
        try:
            is_valid, result = wechat_pay.verify_notify(request.body)
            
            if not is_valid:
                return Response('<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名失败]]></return_msg></xml>', content_type='application/xml')
            
            order_no = result.get('out_trade_no')
            transaction_id = result.get('transaction_id')
            
            try:
                order = Order.objects.get(order_no=order_no)
                if order.status == 'pending':
                    order.status = 'paid'
                    order.transaction_id = transaction_id
                    order.paid_at = timezone.now()
                    order.save()
                    
                    if order.group_buy:
                        order.group_buy.current_people += 1
                        order.group_buy.save()
                    
                    product = order.items.first().product
                    if product:
                        product.sold_count += order.items.first().quantity
                        product.save()
            except Order.DoesNotExist:
                pass
            
            return Response('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>', content_type='application/xml')
        except Exception as e:
            return Response('<xml><return_code><![CDATA[FAIL]]></return_code></xml>', content_type='application/xml')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
