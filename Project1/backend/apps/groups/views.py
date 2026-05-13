from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GroupBuy
from .serializers import (
    GroupBuyListSerializer, GroupBuyDetailSerializer, GroupBuyCreateSerializer
)
from utils.permissions import IsLeader


class GroupBuyViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active']:
            return [permissions.IsAuthenticated()]
        return [IsLeader()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GroupBuyCreateSerializer
        if self.action == 'retrieve':
            return GroupBuyDetailSerializer
        return GroupBuyListSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'leader':
            return GroupBuy.objects.filter(leader=self.request.user).select_related('product', 'leader')
        return GroupBuy.objects.filter(status='active').select_related('product', 'leader')
    
    def perform_create(self, serializer):
        product = serializer.validated_data['product']
        serializer.save(leader=self.request.user, group_price=product.group_price)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        groups = GroupBuy.objects.filter(status='active').select_related('product', 'leader')
        page = self.paginate_queryset(groups)
        if page is not None:
            serializer = GroupBuyListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = GroupBuyListSerializer(groups, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsLeader])
    def end(self, request, pk=None):
        group = self.get_object()
        group.status = 'ended'
        group.save()
        return Response({'message': '团购已结束'})
