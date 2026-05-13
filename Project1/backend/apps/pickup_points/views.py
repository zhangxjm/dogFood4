from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PickupPoint
from .serializers import PickupPointSerializer
from utils.permissions import IsLeader


class PickupPointViewSet(viewsets.ModelViewSet):
    serializer_class = PickupPointSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'public']:
            return [permissions.IsAuthenticated()]
        return [IsLeader()]
    
    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'leader':
            return PickupPoint.objects.filter(leader=self.request.user)
        return PickupPoint.objects.filter(status='active')
    
    def perform_create(self, serializer):
        serializer.save(leader=self.request.user)
    
    @action(detail=False, methods=['get'])
    def public(self, request):
        points = PickupPoint.objects.filter(status='active')
        serializer = self.get_serializer(points, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsLeader])
    def mine(self, request):
        points = PickupPoint.objects.filter(leader=request.user)
        serializer = self.get_serializer(points, many=True)
        return Response(serializer.data)
