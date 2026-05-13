from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PickupPointViewSet

router = DefaultRouter()
router.register(r'', PickupPointViewSet, basename='pickup-point')

urlpatterns = [
    path('', include(router.urls)),
]
