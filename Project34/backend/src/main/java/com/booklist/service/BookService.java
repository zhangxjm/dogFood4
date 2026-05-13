package com.booklist.service;

import com.booklist.entity.Book;
import com.booklist.entity.Book.ReadingStatus;
import com.booklist.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("书籍不存在: " + id));
    }

    public List<Book> getBooksByStatus(ReadingStatus status) {
        return bookRepository.findByStatus(status);
    }

    public List<Book> getBooksByCategoryId(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public List<Book> searchBooks(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public Book createBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = getBookById(id);
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setPublisher(bookDetails.getPublisher());
        book.setPublishDate(bookDetails.getPublishDate());
        book.setDescription(bookDetails.getDescription());
        book.setCoverUrl(bookDetails.getCoverUrl());
        book.setIsbn(bookDetails.getIsbn());
        book.setStatus(bookDetails.getStatus());
        book.setTotalPages(bookDetails.getTotalPages());
        book.setCurrentPage(bookDetails.getCurrentPage());
        book.setRating(bookDetails.getRating());
        book.setTags(bookDetails.getTags());
        book.setCategory(bookDetails.getCategory());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }

    public long countByStatus(ReadingStatus status) {
        return bookRepository.countByStatus(status);
    }
}
