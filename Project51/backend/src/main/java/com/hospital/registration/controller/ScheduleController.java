package com.hospital.registration.controller;

import com.hospital.registration.dto.Result;
import com.hospital.registration.entity.Schedule;
import com.hospital.registration.service.ScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin
public class ScheduleController {
    @Autowired
    private ScheduleService scheduleService;

    @GetMapping("/date/{date}")
    public Result<List<Schedule>> getSchedulesByDate(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(scheduleService.getSchedulesByDate(date));
    }

    @GetMapping("/department/{departmentId}/date/{date}")
    public Result<List<Schedule>> getSchedulesByDepartmentAndDate(
            @PathVariable Long departmentId,
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(scheduleService.getSchedulesByDepartmentAndDate(departmentId, date));
    }

    @GetMapping("/range")
    public Result<List<Schedule>> getSchedulesByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        return Result.success(scheduleService.getSchedulesByDateRange(startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<Schedule> getScheduleById(@PathVariable Long id) {
        return scheduleService.getScheduleById(id)
                .map(Result::success)
                .orElse(Result.error("排班不存在"));
    }

    @PostMapping
    public Result<Schedule> createSchedule(@RequestBody Schedule schedule) {
        try {
            return Result.success(scheduleService.createSchedule(schedule));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Schedule> updateSchedule(@PathVariable Long id, @RequestBody Schedule schedule) {
        try {
            return Result.success(scheduleService.updateSchedule(id, schedule));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteSchedule(@PathVariable Long id) {
        try {
            scheduleService.deleteSchedule(id);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
