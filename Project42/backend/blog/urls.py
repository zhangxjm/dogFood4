from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet)
router.register('tags', views.TagViewSet)
router.register('articles', views.ArticleViewSet)
router.register('comments', views.CommentViewSet)
router.register('visitors', views.VisitorViewSet)
router.register('daily-stats', views.DailyStatsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]
