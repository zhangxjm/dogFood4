from django.db import models
from apps.users.models import User
from apps.products.models import Product
from apps.groups.models import GroupBuy
from apps.pickup_points.models import PickupPoint


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('shipped', '已发货'),
        ('delivered', '已送达'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
        ('refunded', '已退款'),
    )
    
    PAYMENT_CHOICES = (
        ('wechat', '微信支付'),
        ('balance', '余额支付'),
    )
    
    PICKUP_CHOICES = (
        ('self', '自提'),
        ('delivery', '配送'),
    )
    
    order_no = models.CharField('订单号', max_length=32, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', verbose_name='用户')
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leader_orders', verbose_name='团长')
    pickup_point = models.ForeignKey(PickupPoint, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='自提点')
    group_buy = models.ForeignKey(GroupBuy, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders', verbose_name='团购活动')
    total_amount = models.DecimalField('订单总金额', max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField('优惠金额', max_digits=10, decimal_places=2, default=0)
    pay_amount = models.DecimalField('实付金额', max_digits=10, decimal_places=2, default=0)
    status = models.CharField('订单状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField('支付方式', max_length=20, choices=PAYMENT_CHOICES, default='wechat')
    pickup_method = models.CharField('提货方式', max_length=20, choices=PICKUP_CHOICES, default='self')
    receiver_name = models.CharField('收货人', max_length=50, blank=True, null=True)
    receiver_phone = models.CharField('收货电话', max_length=11, blank=True, null=True)
    receiver_address = models.CharField('收货地址', max_length=200, blank=True, null=True)
    remark = models.TextField('备注', blank=True, null=True)
    transaction_id = models.CharField('微信支付订单号', max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField('支付时间', blank=True, null=True)
    completed_at = models.DateTimeField('完成时间', blank=True, null=True)
    verification_code = models.CharField('核销码', max_length=8, unique=True, blank=True, null=True)
    is_verified = models.BooleanField('是否已核销', default=False)
    verified_at = models.DateTimeField('核销时间', blank=True, null=True)
    commission = models.DecimalField('团长佣金', max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'orders'
        verbose_name = '订单'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return self.order_no


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='订单')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, verbose_name='商品')
    product_name = models.CharField('商品名称', max_length=100)
    product_image = models.CharField('商品图片', max_length=500, blank=True, null=True)
    price = models.DecimalField('单价', max_digits=10, decimal_places=2)
    quantity = models.IntegerField('数量')
    total_price = models.DecimalField('小计', max_digits=10, decimal_places=2)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'order_items'
        verbose_name = '订单明细'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return f"{self.order.order_no} - {self.product_name}"
