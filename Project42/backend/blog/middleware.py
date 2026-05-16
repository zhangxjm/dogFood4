from django.utils import timezone
from django.db import DatabaseError
from .models import Visitor, DailyStats


class VisitorStatsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if not request.path.startswith('/api/'):
            return response
        
        ip_address = request.META.get('REMOTE_ADDR')
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        
        if ip_address:
            try:
                today = timezone.now().date()
                
                visitor, created = Visitor.objects.get_or_create(
                    ip_address=ip_address,
                    defaults={
                        'user_agent': request.META.get('HTTP_USER_AGENT', '')
                    }
                )
                
                if not created:
                    visitor.visit_count += 1
                visitor.page_views += 1
                visitor.save()
                
                stats, _ = DailyStats.objects.get_or_create(date=today)
                stats.page_views += 1
                
                if created:
                    stats.new_visitors += 1
                    stats.unique_visitors += 1
                else:
                    if visitor.last_visit.date() != today:
                        stats.unique_visitors += 1
                
                stats.save()
            except DatabaseError:
                pass
        
        return response
