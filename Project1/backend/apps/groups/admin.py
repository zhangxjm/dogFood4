from django.contrib import admin
from .models import GroupBuy


@admin.register(GroupBuy)
class GroupBuyAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'leader', 'product', 'group_price', 'current_people', 'min_group_size', 'status', 'start_time', 'end_time']
    list_filter = ['status']
    search_fields = ['title', 'leader__username', 'product__name']
    ordering = ['-created_at']
    raw_id_fields = ['leader', 'product']
