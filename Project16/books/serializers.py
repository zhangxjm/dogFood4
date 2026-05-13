from rest_framework import serializers
from .models import Book, Student, BorrowRecord


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class BorrowRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')
    student_id = serializers.ReadOnlyField(source='student.student_id')
    book_title = serializers.ReadOnlyField(source='book.title')
    book_id = serializers.ReadOnlyField(source='book.book_id')

    class Meta:
        model = BorrowRecord
        fields = ['id', 'student', 'student_name', 'student_id', 'book', 'book_title', 'book_id',
                  'borrow_date', 'return_date', 'is_returned', 'created_at']
        read_only_fields = ['borrow_date', 'return_date', 'is_returned']


class BorrowRecordCreateSerializer(serializers.Serializer):
    student_id = serializers.CharField(max_length=50)
    book_id = serializers.CharField(max_length=50)
