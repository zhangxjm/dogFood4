package com.booklist.controller;

import com.booklist.entity.Book;
import com.booklist.entity.Book.ReadingStatus;
import com.booklist.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks(
            @RequestParam(required = false) ReadingStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        
        List<Book> books;
        if (keyword != null && !keyword.isEmpty()) {
            books = bookService.searchBooks(keyword);
        } else if (categoryId != null) {
            books = bookService.getBooksByCategoryId(categoryId);
        } else if (status != null) {
            books = bookService.getBooksByStatus(status);
        } else {
            books = bookService.getAllBooks();
        }
        return ResponseEntity.ok(books);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
            "wantToRead", bookService.countByStatus(ReadingStatus.WANT_TO_READ),
            "reading", bookService.countByStatus(ReadingStatus.READING),
            "finished", bookService.countByStatus(ReadingStatus.FINISHED),
            "abandoned", bookService.countByStatus(ReadingStatus.ABANDONED)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Book created = bookService.createBook(book);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        Book updated = bookService.updateBook(id, book);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
