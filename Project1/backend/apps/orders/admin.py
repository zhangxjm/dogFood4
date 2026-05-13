from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_no', 'user', 'leader', 'pay_amount', 'status', 'is_verified', 'created_at']
    list_filter = ['status', 'is_verified', 'payment_method']
    search_fields = ['order_no', 'user__username', 'leader__username']
    ordering = ['-created_at']
    raw_id_fields = ['user', 'leader', 'pickup_point', 'group_buy']
    inlines = [OrderItemInline]
