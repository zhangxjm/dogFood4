package com.gym.reservation.service;

import com.gym.reservation.entity.Course;
import com.gym.reservation.repository.CourseRepository;
import com.gym.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    public List<Course> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        for (Course course : courses) {
            Long count = reservationRepository.countByCourseIdAndStatus(course.getId(), "ACTIVE");
            course.setReservedCount(count.intValue());
        }
        return courses;
    }
    
    public List<Course> getAvailableCourses() {
        List<Course> courses = courseRepository.findByCourseDateGreaterThanEqualOrderByCourseDateAscStartTimeAsc(LocalDate.now());
        for (Course course : courses) {
            Long count = reservationRepository.countByCourseIdAndStatus(course.getId(), "ACTIVE");
            course.setReservedCount(count.intValue());
        }
        return courses;
    }
    
    public Optional<Course> getCourseById(Long id) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            Long count = reservationRepository.countByCourseIdAndStatus(course.getId(), "ACTIVE");
            course.setReservedCount(count.intValue());
        }
        return courseOpt;
    }
    
    @Transactional
    public Course createCourse(Course course) {
        if (course.getMaxCapacity() == null) {
            course.setMaxCapacity(10);
        }
        if (course.getStatus() == null) {
            course.setStatus("AVAILABLE");
        }
        return courseRepository.save(course);
    }
    
    @Transactional
    public Course updateCourse(Long id, Course courseDetails) {
        return courseRepository.findById(id)
            .map(course -> {
                course.setName(courseDetails.getName());
                course.setInstructor(courseDetails.getInstructor());
                course.setCourseDate(courseDetails.getCourseDate());
                course.setStartTime(courseDetails.getStartTime());
                course.setEndTime(courseDetails.getEndTime());
                if (courseDetails.getMaxCapacity() != null) {
                    course.setMaxCapacity(courseDetails.getMaxCapacity());
                }
                course.setDescription(courseDetails.getDescription());
                if (courseDetails.getStatus() != null) {
                    course.setStatus(courseDetails.getStatus());
                }
                return courseRepository.save(course);
            })
            .orElseThrow(() -> new RuntimeException("课程不存在"));
    }
    
    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("课程不存在");
        }
        courseRepository.deleteById(id);
    }
}
