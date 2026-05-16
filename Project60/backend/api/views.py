from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone

from .models import Teacher, Course, Student, ClassInfo, Enrollment, Payment, ClassRecord, Attendance
from .serializers import (
    TeacherSerializer, CourseSerializer, StudentSerializer, ClassInfoSerializer,
    EnrollmentSerializer, PaymentSerializer, ClassRecordSerializer, AttendanceSerializer,
    StatisticsSerializer
)


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all().order_by('-created_at')
    serializer_class = TeacherSerializer
    permission_classes = [AllowAny]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]


class ClassInfoViewSet(viewsets.ModelViewSet):
    queryset = ClassInfo.objects.all().order_by('-created_at')
    serializer_class = ClassInfoSerializer
    permission_classes = [AllowAny]


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all().order_by('-enrolled_at')
    serializer_class = EnrollmentSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        student_id = request.data.get('student')
        course_id = request.data.get('course')
        class_info_id = request.data.get('class_info')
        
        if class_info_id:
            class_info = ClassInfo.objects.get(id=class_info_id)
            if class_info.student_count >= class_info.max_students:
                return Response(
                    {'error': '班级人数已满'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        course = Course.objects.get(id=course_id)
        request.data['total_hours'] = course.total_hours
        request.data['remaining_hours'] = course.total_hours
        
        return super().create(request, *args, **kwargs)


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-paid_at')
    serializer_class = PaymentSerializer
    permission_classes = [AllowAny]


class ClassRecordViewSet(viewsets.ModelViewSet):
    queryset = ClassRecord.objects.all().order_by('-date')
    serializer_class = ClassRecordSerializer
    permission_classes = [AllowAny]


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().order_by('-created_at')
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]


@api_view(['GET'])
@permission_classes([AllowAny])
def get_statistics(request):
    total_students = Student.objects.count()
    total_courses = Course.objects.count()
    total_teachers = Teacher.objects.count()
    total_classes = ClassInfo.objects.count()
    total_enrollments = Enrollment.objects.filter(status='active').count()
    
    total_payments = Payment.objects.filter(status='paid').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    class_statistics = ClassInfo.objects.annotate(
        count=Count('enrollment', filter=Count('enrollment__status', status='active'))
    ).values('id', 'name', 'max_students')
    
    class_stats_list = []
    for cls in class_statistics:
        class_info = ClassInfo.objects.get(id=cls['id'])
        class_stats_list.append({
            'id': cls['id'],
            'name': cls['name'],
            'max_students': cls['max_students'],
            'current_students': class_info.student_count
        })
    
    data = {
        'total_students': total_students,
        'total_courses': total_courses,
        'total_teachers': total_teachers,
        'total_classes': total_classes,
        'total_enrollments': total_enrollments,
        'total_payments': total_payments,
        'class_statistics': class_stats_list
    }
    
    serializer = StatisticsSerializer(data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def enroll_and_pay(request):
    student_id = request.data.get('student_id')
    course_id = request.data.get('course_id')
    class_info_id = request.data.get('class_info_id')
    payment_method = request.data.get('payment_method', '微信')
    amount = request.data.get('amount')
    
    if class_info_id:
        class_info = ClassInfo.objects.get(id=class_info_id)
        if class_info.student_count >= class_info.max_students:
            return Response(
                {'error': '班级人数已满'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    course = Course.objects.get(id=course_id)
    student = Student.objects.get(id=student_id)
    
    enrollment = Enrollment.objects.create(
        student=student,
        course=course,
        class_info_id=class_info_id,
        total_hours=course.total_hours,
        remaining_hours=course.total_hours,
        status='active'
    )
    
    payment = Payment.objects.create(
        enrollment=enrollment,
        student=student,
        course=course,
        amount=amount or course.price,
        payment_method=payment_method,
        status='paid'
    )
    
    return Response({
        'enrollment': EnrollmentSerializer(enrollment).data,
        'payment': PaymentSerializer(payment).data
    }, status=status.HTTP_201_CREATED)
