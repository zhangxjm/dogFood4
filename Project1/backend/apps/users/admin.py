from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, LeaderProfile, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['id', 'username', 'phone', 'role', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'phone']
    ordering = ['-date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('扩展信息', {'fields': ('role', 'phone', 'avatar', 'openid', 'unionid')}),
    )


@admin.register(LeaderProfile)
class LeaderProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'community_name', 'phone', 'status', 'commission_rate', 'total_commission', 'created_at']
    list_filter = ['status']
    search_fields = ['user__username', 'community_name', 'phone']
    ordering = ['-created_at']
    raw_id_fields = ['user']


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'name', 'phone', 'province', 'city', 'district', 'is_default', 'created_at']
    list_filter = ['is_default']
    search_fields = ['user__username', 'name', 'phone']
    ordering = ['-created_at']
    raw_id_fields = ['user']
