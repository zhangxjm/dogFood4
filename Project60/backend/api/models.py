from django.db import models
from django.contrib.auth.models import User


class Teacher(models.Model):
    name = models.CharField(max_length=100, verbose_name='姓名')
    phone = models.CharField(max_length=20, verbose_name='电话')
    subject = models.CharField(max_length=100, verbose_name='教授科目')
    experience = models.IntegerField(default=0, verbose_name='教龄(年)')
    avatar = models.CharField(max_length=255, blank=True, null=True, verbose_name='头像')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '老师'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Course(models.Model):
    name = models.CharField(max_length=100, verbose_name='课程名称')
    description = models.TextField(blank=True, null=True, verbose_name='课程描述')
    total_hours = models.IntegerField(default=0, verbose_name='总课时')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='课程价格')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, verbose_name='授课老师')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '课程'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class Student(models.Model):
    GENDER_CHOICES = [
        ('male', '男'),
        ('female', '女'),
    ]
    name = models.CharField(max_length=100, verbose_name='姓名')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, verbose_name='性别')
    age = models.IntegerField(verbose_name='年龄')
    phone = models.CharField(max_length=20, verbose_name='家长电话')
    parent_name = models.CharField(max_length=100, verbose_name='家长姓名')
    avatar = models.CharField(max_length=255, blank=True, null=True, verbose_name='头像')
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name='地址')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '学员'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name


class ClassInfo(models.Model):
    name = models.CharField(max_length=100, verbose_name='班级名称')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name='所属课程')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, verbose_name='授课老师')
    max_students = models.IntegerField(default=20, verbose_name='最大人数')
    schedule = models.CharField(max_length=255, verbose_name='上课时间')
    start_date = models.DateField(verbose_name='开课日期')
    end_date = models.DateField(verbose_name='结课日期')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '班级'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name

    @property
    def student_count(self):
        return self.enrollment_set.filter(status='active').count()


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('active', '在读'),
        ('completed', '已结课'),
        ('cancelled', '已取消'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='学员')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name='课程')
    class_info = models.ForeignKey(ClassInfo, on_delete=models.SET_NULL, null=True, verbose_name='班级')
    remaining_hours = models.IntegerField(default=0, verbose_name='剩余课时')
    total_hours = models.IntegerField(default=0, verbose_name='总课时')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='状态')
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name='报名时间')

    class Meta:
        verbose_name = '报名记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.student.name} - {self.course.name}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('refunded', '已退款'),
    ]
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, verbose_name='报名记录')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='学员')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name='课程')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='支付金额')
    payment_method = models.CharField(max_length=50, verbose_name='支付方式')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='paid', verbose_name='状态')
    transaction_id = models.CharField(max_length=100, blank=True, null=True, verbose_name='交易单号')
    remark = models.TextField(blank=True, null=True, verbose_name='备注')
    paid_at = models.DateTimeField(auto_now_add=True, verbose_name='支付时间')

    class Meta:
        verbose_name = '缴费记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.student.name} - {self.amount}"


class ClassRecord(models.Model):
    class_info = models.ForeignKey(ClassInfo, on_delete=models.CASCADE, verbose_name='班级')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, verbose_name='授课老师')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name='课程')
    date = models.DateField(verbose_name='上课日期')
    start_time = models.TimeField(verbose_name='开始时间')
    end_time = models.TimeField(verbose_name='结束时间')
    hours = models.IntegerField(default=1, verbose_name='课时数')
    content = models.TextField(blank=True, null=True, verbose_name='课程内容')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '上课记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.class_info.name} - {self.date}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.deduct_hours()

    def deduct_hours(self):
        enrollments = Enrollment.objects.filter(
            class_info=self.class_info,
            status='active',
            remaining_hours__gte=self.hours
        )
        for enrollment in enrollments:
            enrollment.remaining_hours -= self.hours
            enrollment.save()
            Attendance.objects.create(
                class_record=self,
                student=enrollment.student,
                enrollment=enrollment,
                hours=self.hours,
                status='present'
            )


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', '出勤'),
        ('absent', '缺勤'),
        ('late', '迟到'),
        ('leave', '请假'),
    ]
    class_record = models.ForeignKey(ClassRecord, on_delete=models.CASCADE, verbose_name='上课记录')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='学员')
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, verbose_name='报名记录')
    hours = models.IntegerField(default=1, verbose_name='消耗课时')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present', verbose_name='出勤状态')
    remark = models.TextField(blank=True, null=True, verbose_name='备注')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')

    class Meta:
        verbose_name = '出勤记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f"{self.student.name} - {self.class_record.date}"
