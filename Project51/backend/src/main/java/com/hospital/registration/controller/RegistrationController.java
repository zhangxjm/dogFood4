package com.hospital.registration.controller;

import com.hospital.registration.dto.Result;
import com.hospital.registration.entity.Registration;
import com.hospital.registration.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/registrations")
@CrossOrigin
public class RegistrationController {
    @Autowired
    private RegistrationService registrationService;

    @GetMapping
    public Result<List<Registration>> getAllRegistrations() {
        return Result.success(registrationService.getAllRegistrations());
    }

    @GetMapping("/phone/{phone}")
    public Result<List<Registration>> getRegistrationsByPhone(@PathVariable String phone) {
        return Result.success(registrationService.getRegistrationsByPhone(phone));
    }

    @GetMapping("/range")
    public Result<List<Registration>> getRegistrationsByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        return Result.success(registrationService.getRegistrationsByDateRange(startTime, endTime));
    }

    @GetMapping("/{id}")
    public Result<Registration> getRegistrationById(@PathVariable Long id) {
        return registrationService.getRegistrationById(id)
                .map(Result::success)
                .orElse(Result.error("挂号记录不存在"));
    }

    @PostMapping
    public Result<Registration> createRegistration(@RequestBody Registration registration) {
        try {
            return Result.success(registrationService.createRegistration(registration));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public Result<Registration> updateRegistrationStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        try {
            return Result.success(registrationService.updateRegistrationStatus(id, status));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public Result<Void> cancelRegistration(@PathVariable Long id) {
        try {
            registrationService.cancelRegistration(id);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
