from django.db import models


class Student(models.Model):
    student_id = models.CharField('学号', max_length=50, unique=True)
    name = models.CharField('姓名', max_length=100)
    class_name = models.CharField('班级', max_length=100)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'student'
        verbose_name = '学生'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.name} ({self.student_id})'


class Book(models.Model):
    book_id = models.CharField('图书编号', max_length=50, unique=True)
    title = models.CharField('书名', max_length=200)
    author = models.CharField('作者', max_length=100)
    publisher = models.CharField('出版社', max_length=200, blank=True, null=True)
    total_quantity = models.IntegerField('总数量', default=1)
    available_quantity = models.IntegerField('可借数量', default=1)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'book'
        verbose_name = '图书'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.title} ({self.book_id})'


class BorrowRecord(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, verbose_name='学生')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, verbose_name='图书')
    borrow_date = models.DateField('借阅日期', auto_now_add=True)
    return_date = models.DateField('归还日期', null=True, blank=True)
    is_returned = models.BooleanField('是否已归还', default=False)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        db_table = 'borrow_record'
        verbose_name = '借阅记录'
        verbose_name_plural = verbose_name

    def __str__(self):
        return f'{self.student.name} - {self.book.title}'
