package com.gym.reservation.repository;

import com.gym.reservation.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByCourseDateOrderByStartTimeAsc(LocalDate courseDate);
    List<Course> findByCourseDateGreaterThanEqualOrderByCourseDateAscStartTimeAsc(LocalDate date);
    List<Course> findByStatusOrderByCourseDateAscStartTimeAsc(String status);
}
