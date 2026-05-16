from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q, Sum
from django.utils import timezone
from .models import Category, Tag, Article, Comment, Visitor, DailyStats
from .serializers import (
    CategorySerializer, TagSerializer, ArticleListSerializer,
    ArticleDetailSerializer, ArticleCreateUpdateSerializer, CommentSerializer,
    CommentManageSerializer, VisitorSerializer, DailyStatsSerializer,
    DashboardStatsSerializer, MyTokenObtainPairSerializer
)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'views']

    def get_queryset(self):
        queryset = Article.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='published')
        category = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        if category:
            queryset = queryset.filter(category__slug=category)
        if tag:
            queryset = queryset.filter(tags__slug=tag)
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ArticleCreateUpdateSerializer
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return ArticleListSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def recent(self, request):
        articles = self.get_queryset().filter(status='published')[:5]
        serializer = ArticleListSerializer(articles, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Comment.objects.filter(status='approved')
        if self.request.user.is_staff:
            queryset = Comment.objects.all()
        article = self.request.query_params.get('article')
        if article:
            queryset = queryset.filter(article_id=article)
        return queryset

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return CommentManageSerializer
        return CommentSerializer

    def perform_create(self, serializer):
        ip_address = self.request.META.get('REMOTE_ADDR')
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(',')[0]
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')
        serializer.save(
            ip_address=ip_address,
            user_agent=user_agent,
            status='pending'
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        comment = self.get_object()
        comment.status = 'approved'
        comment.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        comment = self.get_object()
        comment.status = 'rejected'
        comment.save()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        comments = Comment.objects.filter(status='pending')
        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)


class VisitorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['last_visit', 'visit_count', 'page_views']


class DailyStatsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DailyStats.objects.all()
    serializer_class = DailyStatsSerializer
    permission_classes = [permissions.IsAdminUser]


@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def dashboard_stats(request):
    total_articles = Article.objects.count()
    total_comments = Comment.objects.count()
    total_views = Article.objects.aggregate(Sum('views'))['views__sum'] or 0
    pending_comments = Comment.objects.filter(status='pending').count()
    
    today = timezone.now().date()
    today_stats = DailyStats.objects.filter(date=today).first()
    today_views = today_stats.page_views if today_stats else 0
    today_visitors = today_stats.unique_visitors if today_stats else 0

    data = {
        'total_articles': total_articles,
        'total_comments': total_comments,
        'total_views': total_views,
        'pending_comments': pending_comments,
        'today_views': today_views,
        'today_visitors': today_visitors,
    }
    serializer = DashboardStatsSerializer(data)
    return Response(serializer.data)
