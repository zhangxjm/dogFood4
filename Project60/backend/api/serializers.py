from rest_framework import serializers
from .models import Teacher, Course, Student, ClassInfo, Enrollment, Payment, ClassRecord, Attendance


class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class ClassInfoSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source='course.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    student_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ClassInfo
        fields = '__all__'


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    class_name = serializers.CharField(source='class_info.name', read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'


class ClassRecordSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='class_info.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = ClassRecord
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class StatisticsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_classes = serializers.IntegerField()
    total_enrollments = serializers.IntegerField()
    total_payments = serializers.DecimalField(max_digits=12, decimal_places=2)
    class_statistics = serializers.ListField(child=serializers.DictField())
