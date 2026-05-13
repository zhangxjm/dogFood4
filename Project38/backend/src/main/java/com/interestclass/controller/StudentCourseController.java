package com.interestclass.controller;

import com.interestclass.entity.StudentCourse;
import com.interestclass.service.StudentCourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student-courses")
public class StudentCourseController {
    
    @Autowired
    private StudentCourseService studentCourseService;
    
    @GetMapping
    public List<StudentCourse> getAllStudentCourses() {
        return studentCourseService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<StudentCourse> getStudentCourseById(@PathVariable Long id) {
        return studentCourseService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/student/{studentId}")
    public List<StudentCourse> getStudentCoursesByStudentId(@PathVariable Long studentId) {
        return studentCourseService.findByStudentId(studentId);
    }
    
    @GetMapping("/course/{courseId}")
    public List<StudentCourse> getStudentCoursesByCourseId(@PathVariable Long courseId) {
        return studentCourseService.findByCourseId(courseId);
    }
    
    @PostMapping
    public StudentCourse createStudentCourse(@RequestBody StudentCourse studentCourse) {
        return studentCourseService.save(studentCourse);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<StudentCourse> updateStudentCourse(@PathVariable Long id, @RequestBody StudentCourse studentCourseDetails) {
        return studentCourseService.findById(id)
                .map(studentCourse -> {
                    studentCourse.setEnrollDate(studentCourseDetails.getEnrollDate());
                    studentCourse.setStatus(studentCourseDetails.getStatus());
                    studentCourse.setNotes(studentCourseDetails.getNotes());
                    StudentCourse updated = studentCourseService.save(studentCourse);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudentCourse(@PathVariable Long id) {
        return studentCourseService.findById(id)
                .map(studentCourse -> {
                    studentCourseService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
