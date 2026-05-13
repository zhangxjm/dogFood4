package com.booklist.controller;

import com.booklist.entity.ReadingNote;
import com.booklist.service.ReadingNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books/{bookId}/notes")
@RequiredArgsConstructor
public class ReadingNoteController {

    private final ReadingNoteService readingNoteService;

    @GetMapping
    public ResponseEntity<List<ReadingNote>> getNotesByBookId(@PathVariable Long bookId) {
        return ResponseEntity.ok(readingNoteService.getNotesByBookId(bookId));
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<ReadingNote> getNoteById(@PathVariable Long noteId) {
        return ResponseEntity.ok(readingNoteService.getNoteById(noteId));
    }

    @PostMapping
    public ResponseEntity<ReadingNote> createNote(
            @PathVariable Long bookId, 
            @RequestBody ReadingNote note) {
        ReadingNote created = readingNoteService.createNote(bookId, note);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<ReadingNote> updateNote(
            @PathVariable Long noteId, 
            @RequestBody ReadingNote note) {
        ReadingNote updated = readingNoteService.updateNote(noteId, note);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{noteId}")
    public ResponseEntity<Map<String, String>> deleteNote(@PathVariable Long noteId) {
        readingNoteService.deleteNote(noteId);
        return ResponseEntity.ok(Map.of("message", "删除成功"));
    }
}
