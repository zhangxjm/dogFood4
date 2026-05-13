package com.interestclass.controller;

import com.interestclass.entity.Course;
import com.interestclass.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    
    @Autowired
    private CourseService courseService;
    
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return courseService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.save(course);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        return courseService.findById(id)
                .map(course -> {
                    course.setName(courseDetails.getName());
                    course.setCategory(courseDetails.getCategory());
                    course.setDescription(courseDetails.getDescription());
                    course.setPrice(courseDetails.getPrice());
                    course.setDuration(courseDetails.getDuration());
                    course.setTeacher(courseDetails.getTeacher());
                    Course updated = courseService.save(course);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        return courseService.findById(id)
                .map(course -> {
                    courseService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public List<Course> searchCourses(@RequestParam(required = false) String name,
                                     @RequestParam(required = false) String category) {
        if (name != null && !name.isEmpty()) {
            return courseService.searchByName(name);
        }
        if (category != null && !category.isEmpty()) {
            return courseService.findByCategory(category);
        }
        return courseService.findAll();
    }
}
