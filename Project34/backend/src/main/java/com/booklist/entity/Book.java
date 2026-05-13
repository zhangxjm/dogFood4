package com.booklist.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String author;

    private String publisher;

    private LocalDate publishDate;

    @Column(length = 2000)
    private String description;

    private String coverUrl;

    private String isbn;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ReadingStatus status = ReadingStatus.WANT_TO_READ;

    private Integer totalPages;

    private Integer currentPage;

    private Integer rating;

    @Column(length = 2000)
    private String tags;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<ReadingNote> notes = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ReadingStatus {
        WANT_TO_READ, READING, FINISHED, ABANDONED
    }
}
