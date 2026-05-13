from django.contrib import admin
from .models import PickupPoint


@admin.register(PickupPoint)
class PickupPointAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'leader', 'address', 'phone', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'address', 'leader__username']
    ordering = ['-created_at']
    raw_id_fields = ['leader']
