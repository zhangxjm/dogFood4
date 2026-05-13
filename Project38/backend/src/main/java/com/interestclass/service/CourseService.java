package com.interestclass.service;

import com.interestclass.entity.Course;
import com.interestclass.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<Course> findAll() {
        return courseRepository.findAll();
    }
    
    public Optional<Course> findById(Long id) {
        return courseRepository.findById(id);
    }
    
    public Course save(Course course) {
        return courseRepository.save(course);
    }
    
    public void deleteById(Long id) {
        courseRepository.deleteById(id);
    }
    
    public List<Course> searchByName(String name) {
        return courseRepository.findByNameContainingIgnoreCase(name);
    }
    
    public List<Course> findByCategory(String category) {
        return courseRepository.findByCategory(category);
    }
}
