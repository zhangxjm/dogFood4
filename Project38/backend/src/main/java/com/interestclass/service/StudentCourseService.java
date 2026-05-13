package com.interestclass.service;

import com.interestclass.entity.Course;
import com.interestclass.entity.Student;
import com.interestclass.entity.StudentCourse;
import com.interestclass.repository.CourseRepository;
import com.interestclass.repository.StudentCourseRepository;
import com.interestclass.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentCourseService {
    
    @Autowired
    private StudentCourseRepository studentCourseRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<StudentCourse> findAll() {
        return studentCourseRepository.findAll();
    }
    
    public Optional<StudentCourse> findById(Long id) {
        return studentCourseRepository.findById(id);
    }
    
    public List<StudentCourse> findByStudentId(Long studentId) {
        return studentCourseRepository.findByStudentId(studentId);
    }
    
    public List<StudentCourse> findByCourseId(Long courseId) {
        return studentCourseRepository.findByCourseId(courseId);
    }
    
    public StudentCourse save(StudentCourse studentCourse) {
        if (studentCourse.getStudent() != null && studentCourse.getStudent().getId() != null) {
            Optional<Student> student = studentRepository.findById(studentCourse.getStudent().getId());
            student.ifPresent(studentCourse::setStudent);
        }
        
        if (studentCourse.getCourse() != null && studentCourse.getCourse().getId() != null) {
            Optional<Course> course = courseRepository.findById(studentCourse.getCourse().getId());
            course.ifPresent(studentCourse::setCourse);
        }
        
        return studentCourseRepository.save(studentCourse);
    }
    
    public void deleteById(Long id) {
        studentCourseRepository.deleteById(id);
    }
}
