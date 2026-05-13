from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Product
from .serializers import (
    CategorySerializer, ProductListSerializer,
    ProductDetailSerializer, ProductCreateSerializer
)
from utils.permissions import IsLeader, IsOwner


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by('sort', '-created_at')


class ProductViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'group_price', 'sold_count']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'public']:
            return [permissions.IsAuthenticated()]
        return [IsLeader()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'leader':
            return Product.objects.filter(leader=self.request.user)
        return Product.objects.filter(status='up').select_related('leader', 'category')
    
    def perform_create(self, serializer):
        serializer.save(leader=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsLeader])
    def up(self, request, pk=None):
        product = self.get_object()
        product.status = 'up'
        product.save()
        return Response({'message': '上架成功'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsLeader])
    def down(self, request, pk=None):
        product = self.get_object()
        product.status = 'down'
        product.save()
        return Response({'message': '下架成功'})
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        products = Product.objects.filter(status='up').select_related('leader', 'category')
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsLeader])
    def mine(self, request):
        products = Product.objects.filter(leader=request.user)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
