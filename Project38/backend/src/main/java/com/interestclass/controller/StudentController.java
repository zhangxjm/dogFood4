package com.interestclass.controller;

import com.interestclass.entity.Student;
import com.interestclass.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    
    @Autowired
    private StudentService studentService;
    
    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentService.save(student);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        return studentService.findById(id)
                .map(student -> {
                    student.setName(studentDetails.getName());
                    student.setGender(studentDetails.getGender());
                    student.setBirthDate(studentDetails.getBirthDate());
                    student.setPhone(studentDetails.getPhone());
                    student.setParentName(studentDetails.getParentName());
                    student.setParentPhone(studentDetails.getParentPhone());
                    student.setAddress(studentDetails.getAddress());
                    student.setNotes(studentDetails.getNotes());
                    Student updated = studentService.save(student);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        return studentService.findById(id)
                .map(student -> {
                    studentService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Student> searchStudents(@RequestParam(required = false) String name,
                                       @RequestParam(required = false) String phone) {
        if (name != null && !name.isEmpty()) {
            return studentService.searchByName(name);
        }
        if (phone != null && !phone.isEmpty()) {
            return studentService.searchByPhone(phone);
        }
        return studentService.findAll();
    }
}
