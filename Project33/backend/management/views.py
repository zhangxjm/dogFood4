from datetime import date, timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Technician, Schedule
from .serializers import TechnicianSerializer, ScheduleSerializer


class TechnicianViewSet(viewsets.ModelViewSet):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status')
        keyword = self.request.query_params.get('keyword')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if keyword:
            queryset = queryset.filter(
                Q(name__icontains=keyword) | 
                Q(phone__icontains=keyword) |
                Q(position__icontains=keyword)
            )
        return queryset
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_techs = self.get_queryset().filter(status=Technician.STATUS_ACTIVE)
        serializer = self.get_serializer(active_techs, many=True)
        return Response(serializer.data)


class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        technician_id = self.request.query_params.get('technician')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        if technician_id:
            queryset = queryset.filter(technician_id=technician_id)
        
        return queryset.select_related('technician')
    
    @action(detail=False, methods=['get'])
    def week(self, request):
        today = date.today()
        start_week = today - timedelta(days=today.weekday())
        end_week = start_week + timedelta(days=6)
        
        schedules = self.get_queryset().filter(
            date__gte=start_week,
            date__lte=end_week
        )
        serializer = self.get_serializer(schedules, many=True)
        return Response({
            'start_date': start_week.isoformat(),
            'end_date': end_week.isoformat(),
            'schedules': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def month(self, request):
        today = date.today()
        start_month = today.replace(day=1)
        if today.month == 12:
            end_month = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_month = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        
        schedules = self.get_queryset().filter(
            date__gte=start_month,
            date__lte=end_month
        )
        serializer = self.get_serializer(schedules, many=True)
        return Response({
            'start_date': start_month.isoformat(),
            'end_date': end_month.isoformat(),
            'schedules': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def batch_create(self, request):
        dates = request.data.get('dates', [])
        technician_ids = request.data.get('technicians', [])
        shift = request.data.get('shift', Schedule.SHIFT_FULL)
        notes = request.data.get('notes', '')
        
        if not dates or not technician_ids:
            return Response(
                {'error': '请选择日期和技师'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_schedules = []
        errors = []
        
        for tech_id in technician_ids:
            for d in dates:
                try:
                    schedule = Schedule.objects.create(
                        technician_id=tech_id,
                        date=d,
                        shift=shift,
                        notes=notes
                    )
                    created_schedules.append(schedule)
                except Exception as e:
                    errors.append(f'技师{tech_id}日期{d}: {str(e)}')
        
        serializer = self.get_serializer(created_schedules, many=True)
        return Response({
            'created': serializer.data,
            'errors': errors
        }, status=status.HTTP_201_CREATED)
