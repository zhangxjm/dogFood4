package com.hospital.registration.repository;

import com.hospital.registration.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctorIdAndScheduleDate(Long doctorId, LocalDate scheduleDate);
    List<Schedule> findByScheduleDateAndStatusTrue(LocalDate scheduleDate);
    
    @Query("SELECT s FROM Schedule s WHERE s.doctor.department.id = :departmentId AND s.scheduleDate = :date AND s.status = true")
    List<Schedule> findByDepartmentIdAndScheduleDate(Long departmentId, LocalDate date);
    
    @Query("SELECT s FROM Schedule s WHERE s.scheduleDate >= :startDate AND s.scheduleDate <= :endDate")
    List<Schedule> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    boolean existsByDoctorIdAndScheduleDateAndTimePeriod(Long doctorId, LocalDate scheduleDate, String timePeriod);
}
