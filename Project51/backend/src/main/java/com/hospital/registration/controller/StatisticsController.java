package com.hospital.registration.controller;

import com.hospital.registration.dto.Result;
import com.hospital.registration.entity.Doctor;
import com.hospital.registration.service.DoctorService;
import com.hospital.registration.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin
public class StatisticsController {
    @Autowired
    private RegistrationService registrationService;
    
    @Autowired
    private DoctorService doctorService;

    @GetMapping("/doctor-visits")
    public Result<List<Map<String, Object>>> getDoctorVisitStatistics(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        
        List<Doctor> doctors = doctorService.getAllDoctors();
        List<Map<String, Object>> statistics = new ArrayList<>();
        
        for (Doctor doctor : doctors) {
            Long count = registrationService.getRegistrationCountByDoctorAndDateRange(
                    doctor.getId(), startDate, endDate);
            
            Map<String, Object> stat = new HashMap<>();
            stat.put("doctorId", doctor.getId());
            stat.put("doctorName", doctor.getName());
            stat.put("departmentName", doctor.getDepartment().getName());
            stat.put("title", doctor.getTitle());
            stat.put("visitCount", count);
            
            statistics.add(stat);
        }
        
        return Result.success(statistics);
    }
}
