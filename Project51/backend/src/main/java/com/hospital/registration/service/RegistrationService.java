package com.hospital.registration.service;

import com.hospital.registration.entity.Registration;
import com.hospital.registration.entity.Schedule;
import com.hospital.registration.repository.RegistrationRepository;
import com.hospital.registration.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RegistrationService {
    @Autowired
    private RegistrationRepository registrationRepository;
    
    @Autowired
    private ScheduleRepository scheduleRepository;
    
    @Autowired
    private ScheduleService scheduleService;

    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    public List<Registration> getRegistrationsByPhone(String phone) {
        return registrationRepository.findByPatientPhone(phone);
    }

    public List<Registration> getRegistrationsByDateRange(LocalDateTime startTime, LocalDateTime endTime) {
        return registrationRepository.findByDateRange(startTime, endTime);
    }

    public Optional<Registration> getRegistrationById(Long id) {
        return registrationRepository.findById(id);
    }

    @Transactional
    public Registration createRegistration(Registration registration) {
        Schedule schedule = scheduleRepository.findById(registration.getSchedule().getId())
                .orElseThrow(() -> new RuntimeException("排班不存在"));
        
        if (!schedule.getStatus()) {
            throw new RuntimeException("该排班已取消");
        }
        
        if (schedule.getRemainingCount() <= 0) {
            throw new RuntimeException("号源已用完");
        }
        
        LocalDate scheduleDate = schedule.getScheduleDate();
        LocalTime endTime = schedule.getEndTime();
        LocalDateTime deadline = LocalDateTime.of(scheduleDate, endTime);
        
        if (LocalDateTime.now().isAfter(deadline)) {
            throw new RuntimeException("已超过挂号截止时间");
        }
        
        if (scheduleDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("不能挂过去日期的号");
        }
        
        scheduleService.decreaseRemainingCount(schedule.getId());
        
        String registrationNo = "GH" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        registration.setRegistrationNo(registrationNo);
        registration.setStatus(0);
        
        return registrationRepository.save(registration);
    }

    @Transactional
    public Registration updateRegistrationStatus(Long id, Integer status) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("挂号记录不存在"));
        
        if (registration.getStatus() == 1 && status != 1) {
            scheduleService.increaseRemainingCount(registration.getSchedule().getId());
        }
        
        registration.setStatus(status);
        return registrationRepository.save(registration);
    }

    @Transactional
    public void cancelRegistration(Long id) {
        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("挂号记录不存在"));
        
        if (registration.getStatus() == 2) {
            throw new RuntimeException("该挂号已取消");
        }
        
        scheduleService.increaseRemainingCount(registration.getSchedule().getId());
        registration.setStatus(2);
        registrationRepository.save(registration);
    }

    public Long getRegistrationCountByDoctorAndDateRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        return registrationRepository.countByDoctorIdAndDateRange(doctorId, startDate, endDate);
    }
}
