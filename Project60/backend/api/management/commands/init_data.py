from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Teacher, Course, Student, ClassInfo, Enrollment, Payment
from datetime import date, timedelta


class Command(BaseCommand):
    help = 'Initialize test data'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Superuser created: admin/admin123'))

        if Teacher.objects.count() == 0:
            teachers = [
                Teacher(name='张老师', phone='13800138001', subject='绘画', experience=5),
                Teacher(name='李老师', phone='13800138002', subject='钢琴', experience=8),
                Teacher(name='王老师', phone='13800138003', subject='舞蹈', experience=6),
                Teacher(name='赵老师', phone='13800138004', subject='书法', experience=10),
                Teacher(name='陈老师', phone='13800138005', subject='围棋', experience=7),
            ]
            Teacher.objects.bulk_create(teachers)
            self.stdout.write(self.style.SUCCESS('Teachers created'))

        if Course.objects.count() == 0:
            teacher1 = Teacher.objects.get(name='张老师')
            teacher2 = Teacher.objects.get(name='李老师')
            teacher3 = Teacher.objects.get(name='王老师')
            teacher4 = Teacher.objects.get(name='赵老师')
            teacher5 = Teacher.objects.get(name='陈老师')

            courses = [
                Course(name='少儿绘画基础班', description='学习基础绘画技巧', total_hours=24, price=2400.00, teacher=teacher1),
                Course(name='钢琴入门班', description='钢琴基础教学', total_hours=32, price=4800.00, teacher=teacher2),
                Course(name='少儿舞蹈班', description='芭蕾舞基础', total_hours=24, price=2880.00, teacher=teacher3),
                Course(name='毛笔书法班', description='楷书基础教学', total_hours=20, price=2000.00, teacher=teacher4),
                Course(name='围棋启蒙班', description='围棋基础入门', total_hours=24, price=1800.00, teacher=teacher5),
            ]
            Course.objects.bulk_create(courses)
            self.stdout.write(self.style.SUCCESS('Courses created'))

        if Student.objects.count() == 0:
            students = [
                Student(name='小明', gender='male', age=8, phone='13900139001', parent_name='明爸爸'),
                Student(name='小红', gender='female', age=7, phone='13900139002', parent_name='红妈妈'),
                Student(name='小华', gender='male', age=9, phone='13900139003', parent_name='华爸爸'),
                Student(name='小丽', gender='female', age=6, phone='13900139004', parent_name='丽妈妈'),
                Student(name='小强', gender='male', age=8, phone='13900139005', parent_name='强爸爸'),
                Student(name='小芳', gender='female', age=7, phone='13900139006', parent_name='芳妈妈'),
                Student(name='小军', gender='male', age=9, phone='13900139007', parent_name='军爸爸'),
                Student(name='小燕', gender='female', age=6, phone='13900139008', parent_name='燕妈妈'),
            ]
            Student.objects.bulk_create(students)
            self.stdout.write(self.style.SUCCESS('Students created'))

        if ClassInfo.objects.count() == 0:
            course1 = Course.objects.get(name='少儿绘画基础班')
            course2 = Course.objects.get(name='钢琴入门班')
            course3 = Course.objects.get(name='少儿舞蹈班')
            teacher1 = Teacher.objects.get(name='张老师')
            teacher2 = Teacher.objects.get(name='李老师')
            teacher3 = Teacher.objects.get(name='王老师')

            today = date.today()
            classes = [
                ClassInfo(
                    name='绘画A班',
                    course=course1,
                    teacher=teacher1,
                    max_students=15,
                    schedule='每周六上午9:00-10:30',
                    start_date=today,
                    end_date=today + timedelta(days=180)
                ),
                ClassInfo(
                    name='钢琴A班',
                    course=course2,
                    teacher=teacher2,
                    max_students=10,
                    schedule='每周日下午2:00-3:30',
                    start_date=today,
                    end_date=today + timedelta(days=180)
                ),
                ClassInfo(
                    name='舞蹈A班',
                    course=course3,
                    teacher=teacher3,
                    max_students=12,
                    schedule='每周六下午2:00-3:30',
                    start_date=today,
                    end_date=today + timedelta(days=180)
                ),
            ]
            ClassInfo.objects.bulk_create(classes)
            self.stdout.write(self.style.SUCCESS('Classes created'))

        if Enrollment.objects.count() == 0:
            class1 = ClassInfo.objects.get(name='绘画A班')
            class2 = ClassInfo.objects.get(name='钢琴A班')
            students = Student.objects.all()[:6]
            course1 = Course.objects.get(name='少儿绘画基础班')
            course2 = Course.objects.get(name='钢琴入门班')

            enrollments = []
            for i, student in enumerate(students[:3]):
                enrollments.append(Enrollment(
                    student=student,
                    course=course1,
                    class_info=class1,
                    total_hours=course1.total_hours,
                    remaining_hours=course1.total_hours,
                    status='active'
                ))

            for i, student in enumerate(students[3:6]):
                enrollments.append(Enrollment(
                    student=student,
                    course=course2,
                    class_info=class2,
                    total_hours=course2.total_hours,
                    remaining_hours=course2.total_hours,
                    status='active'
                ))

            Enrollment.objects.bulk_create(enrollments)
            self.stdout.write(self.style.SUCCESS('Enrollments created'))

        if Payment.objects.count() == 0:
            enrollments = Enrollment.objects.all()
            payments = []
            for enrollment in enrollments:
                payments.append(Payment(
                    enrollment=enrollment,
                    student=enrollment.student,
                    course=enrollment.course,
                    amount=enrollment.course.price,
                    payment_method='微信',
                    status='paid'
                ))
            Payment.objects.bulk_create(payments)
            self.stdout.write(self.style.SUCCESS('Payments created'))

        self.stdout.write(self.style.SUCCESS('Data initialization completed!'))
