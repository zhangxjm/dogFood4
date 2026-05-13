from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'sort', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']
    ordering = ['sort', '-created_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'leader', 'category', 'group_price', 'stock', 'status', 'sold_count', 'created_at']
    list_filter = ['status', 'category']
    search_fields = ['name', 'leader__username']
    ordering = ['sort', '-created_at']
    raw_id_fields = ['leader', 'category']
