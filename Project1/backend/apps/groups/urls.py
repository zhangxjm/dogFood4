from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupBuyViewSet

router = DefaultRouter()
router.register(r'', GroupBuyViewSet, basename='group-buy')

urlpatterns = [
    path('', include(router.urls)),
]
