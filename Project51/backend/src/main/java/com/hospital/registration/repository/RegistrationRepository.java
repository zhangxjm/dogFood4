package com.hospital.registration.repository;

import com.hospital.registration.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByPatientPhone(String patientPhone);
    List<Registration> findByScheduleId(Long scheduleId);
    
    @Query("SELECT r FROM Registration r WHERE r.createTime >= :startTime AND r.createTime <= :endTime")
    List<Registration> findByDateRange(LocalDateTime startTime, LocalDateTime endTime);
    
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.schedule.doctor.id = :doctorId AND r.schedule.scheduleDate >= :startDate AND r.schedule.scheduleDate <= :endDate")
    Long countByDoctorIdAndDateRange(Long doctorId, java.time.LocalDate startDate, java.time.LocalDate endDate);
}
