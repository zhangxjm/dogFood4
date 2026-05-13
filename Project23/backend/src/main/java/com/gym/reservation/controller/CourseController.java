package com.gym.reservation.controller;

import com.gym.reservation.common.Result;
import com.gym.reservation.entity.Course;
import com.gym.reservation.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    
    @Autowired
    private CourseService courseService;
    
    @GetMapping
    public Result<List<Course>> getAllCourses() {
        return Result.success(courseService.getAllCourses());
    }
    
    @GetMapping("/available")
    public Result<List<Course>> getAvailableCourses() {
        return Result.success(courseService.getAvailableCourses());
    }
    
    @GetMapping("/{id}")
    public Result<Course> getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id)
            .map(Result::success)
            .orElse(Result.error("课程不存在"));
    }
    
    @PostMapping
    public Result<Course> createCourse(@Valid @RequestBody Course course) {
        try {
            return Result.success(courseService.createCourse(course));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public Result<Course> updateCourse(@PathVariable Long id, @Valid @RequestBody Course course) {
        try {
            return Result.success(courseService.updateCourse(id, course));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
