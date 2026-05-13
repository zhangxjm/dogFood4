package com.booklist.repository;

import com.booklist.entity.Book;
import com.booklist.entity.Book.ReadingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByStatus(ReadingStatus status);
    
    @Query("SELECT b FROM Book b JOIN b.category c WHERE c.id = :categoryId")
    List<Book> findByCategoryId(Long categoryId);
    
    List<Book> findByTitleContainingIgnoreCase(String title);
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.status = :status")
    long countByStatus(ReadingStatus status);
}
