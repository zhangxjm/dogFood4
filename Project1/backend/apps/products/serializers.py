from rest_framework import serializers
from .models import Category, Product
from apps.users.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'image', 'original_price', 'group_price',
            'stock', 'sold_count', 'status', 'leader', 'category_name',
            'sort', 'created_at'
        ]
        read_only_fields = ['id', 'sold_count', 'created_at', 'leader']


class ProductDetailSerializer(serializers.ModelSerializer):
    leader = UserSerializer(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['id', 'sold_count', 'created_at', 'updated_at', 'leader']


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'category', 'name', 'description', 'image', 'original_price',
            'group_price', 'stock', 'status', 'sort'
        ]
