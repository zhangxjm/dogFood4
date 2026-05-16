package com.hospital.registration.service;

import com.hospital.registration.entity.Schedule;
import com.hospital.registration.repository.ScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    public List<Schedule> getSchedulesByDate(LocalDate date) {
        return scheduleRepository.findByScheduleDateAndStatusTrue(date);
    }

    public List<Schedule> getSchedulesByDepartmentAndDate(Long departmentId, LocalDate date) {
        return scheduleRepository.findByDepartmentIdAndScheduleDate(departmentId, date);
    }

    public List<Schedule> getSchedulesByDateRange(LocalDate startDate, LocalDate endDate) {
        return scheduleRepository.findByDateRange(startDate, endDate);
    }

    public Optional<Schedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

    @Transactional
    public Schedule createSchedule(Schedule schedule) {
        boolean exists = scheduleRepository.existsByDoctorIdAndScheduleDateAndTimePeriod(
                schedule.getDoctor().getId(), 
                schedule.getScheduleDate(), 
                schedule.getTimePeriod()
        );
        
        if (exists) {
            throw new RuntimeException("该医生在该时段已有排班");
        }
        
        if (schedule.getScheduleDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("不能创建过去日期的排班");
        }
        
        schedule.setRemainingCount(schedule.getTotalCount());
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public Schedule updateSchedule(Long id, Schedule scheduleDetails) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("排班不存在"));
        
        if (!schedule.getDoctor().getId().equals(scheduleDetails.getDoctor().getId())
                || !schedule.getScheduleDate().equals(scheduleDetails.getScheduleDate())
                || !schedule.getTimePeriod().equals(scheduleDetails.getTimePeriod())) {
            
            boolean exists = scheduleRepository.existsByDoctorIdAndScheduleDateAndTimePeriod(
                    scheduleDetails.getDoctor().getId(),
                    scheduleDetails.getScheduleDate(),
                    scheduleDetails.getTimePeriod()
            );
            
            if (exists) {
                throw new RuntimeException("该医生在该时段已有排班");
            }
        }
        
        int bookedCount = schedule.getTotalCount() - schedule.getRemainingCount();
        if (scheduleDetails.getTotalCount() < bookedCount) {
            throw new RuntimeException("总号源数不能小于已挂号数");
        }
        
        schedule.setDoctor(scheduleDetails.getDoctor());
        schedule.setScheduleDate(scheduleDetails.getScheduleDate());
        schedule.setTimePeriod(scheduleDetails.getTimePeriod());
        schedule.setStartTime(scheduleDetails.getStartTime());
        schedule.setEndTime(scheduleDetails.getEndTime());
        schedule.setTotalCount(scheduleDetails.getTotalCount());
        schedule.setRemainingCount(scheduleDetails.getTotalCount() - bookedCount);
        schedule.setStatus(scheduleDetails.getStatus());
        
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(Long id) {
        Schedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("排班不存在"));
        schedule.setStatus(false);
        scheduleRepository.save(schedule);
    }

    @Transactional
    public void decreaseRemainingCount(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("排班不存在"));
        
        if (schedule.getRemainingCount() <= 0) {
            throw new RuntimeException("号源已用完");
        }
        
        schedule.setRemainingCount(schedule.getRemainingCount() - 1);
        scheduleRepository.save(schedule);
    }

    @Transactional
    public void increaseRemainingCount(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("排班不存在"));
        
        if (schedule.getRemainingCount() < schedule.getTotalCount()) {
            schedule.setRemainingCount(schedule.getRemainingCount() + 1);
            scheduleRepository.save(schedule);
        }
    }
}
