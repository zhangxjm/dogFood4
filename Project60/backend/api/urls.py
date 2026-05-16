from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'teachers', views.TeacherViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'classes', views.ClassInfoViewSet)
router.register(r'enrollments', views.EnrollmentViewSet)
router.register(r'payments', views.PaymentViewSet)
router.register(r'class-records', views.ClassRecordViewSet)
router.register(r'attendances', views.AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('statistics/', views.get_statistics, name='statistics'),
    path('enroll-and-pay/', views.enroll_and_pay, name='enroll-and-pay'),
]
