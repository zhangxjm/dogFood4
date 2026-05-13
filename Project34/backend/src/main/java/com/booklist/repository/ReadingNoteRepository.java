package com.booklist.repository;

import com.booklist.entity.ReadingNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReadingNoteRepository extends JpaRepository<ReadingNote, Long> {
    List<ReadingNote> findByBookIdOrderByCreatedAtDesc(Long bookId);
}
