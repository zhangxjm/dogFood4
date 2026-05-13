from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Book, Student, BorrowRecord
from .serializers import BookSerializer, StudentSerializer, BorrowRecordSerializer, BorrowRecordCreateSerializer


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by('-created_at')
    serializer_class = BookSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if 'available_quantity' not in request.data:
            serializer.validated_data['available_quantity'] = serializer.validated_data.get('total_quantity', 1)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('-created_at')
    serializer_class = StudentSerializer


class BorrowRecordViewSet(viewsets.ModelViewSet):
    queryset = BorrowRecord.objects.all().order_by('-created_at')
    serializer_class = BorrowRecordSerializer

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'borrow':
            return BorrowRecordCreateSerializer
        return BorrowRecordSerializer

    @action(detail=False, methods=['get'], url_path='active')
    def active_borrows(self, request):
        active_records = BorrowRecord.objects.filter(is_returned=False).select_related('student', 'book').order_by('-borrow_date')
        serializer = self.get_serializer(active_records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='borrow')
    def borrow(self, request):
        serializer = BorrowRecordCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            student = Student.objects.get(student_id=serializer.validated_data['student_id'])
        except Student.DoesNotExist:
            return Response({'error': '学生不存在'}, status=status.HTTP_404_NOT_FOUND)

        try:
            book = Book.objects.get(book_id=serializer.validated_data['book_id'])
        except Book.DoesNotExist:
            return Response({'error': '图书不存在'}, status=status.HTTP_404_NOT_FOUND)

        if book.available_quantity <= 0:
            return Response({'error': '该图书已全部借出'}, status=status.HTTP_400_BAD_REQUEST)

        if BorrowRecord.objects.filter(student=student, book=book, is_returned=False).exists():
            return Response({'error': '该学生已借阅过此书且未归还'}, status=status.HTTP_400_BAD_REQUEST)

        borrow_record = BorrowRecord.objects.create(student=student, book=book)
        book.available_quantity -= 1
        book.save()

        return_serializer = BorrowRecordSerializer(borrow_record)
        return Response(return_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='return')
    def return_book(self, request, pk=None):
        try:
            record = self.get_object()
        except BorrowRecord.DoesNotExist:
            return Response({'error': '借阅记录不存在'}, status=status.HTTP_404_NOT_FOUND)

        if record.is_returned:
            return Response({'error': '该图书已归还'}, status=status.HTTP_400_BAD_REQUEST)

        record.is_returned = True
        record.return_date = timezone.now().date()
        record.save()

        book = record.book
        book.available_quantity += 1
        book.save()

        serializer = self.get_serializer(record)
        return Response(serializer.data)
