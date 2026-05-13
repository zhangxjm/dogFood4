package com.booklist.service;

import com.booklist.entity.Book;
import com.booklist.entity.ReadingNote;
import com.booklist.repository.BookRepository;
import com.booklist.repository.ReadingNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReadingNoteService {

    private final ReadingNoteRepository readingNoteRepository;
    private final BookRepository bookRepository;

    public List<ReadingNote> getNotesByBookId(Long bookId) {
        return readingNoteRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    public ReadingNote getNoteById(Long id) {
        return readingNoteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("读书笔记不存在: " + id));
    }

    public ReadingNote createNote(Long bookId, ReadingNote note) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("书籍不存在: " + bookId));
        note.setBook(book);
        return readingNoteRepository.save(note);
    }

    public ReadingNote updateNote(Long id, ReadingNote noteDetails) {
        ReadingNote note = getNoteById(id);
        note.setContent(noteDetails.getContent());
        note.setPageNumber(noteDetails.getPageNumber());
        note.setChapter(noteDetails.getChapter());
        return readingNoteRepository.save(note);
    }

    public void deleteNote(Long id) {
        ReadingNote note = getNoteById(id);
        readingNoteRepository.delete(note);
    }
}
