package com.hospital.registration.controller;

import com.hospital.registration.dto.Result;
import com.hospital.registration.entity.Doctor;
import com.hospital.registration.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin
public class DoctorController {
    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public Result<List<Doctor>> getAllDoctors() {
        return Result.success(doctorService.getAllDoctors());
    }

    @GetMapping("/department/{departmentId}")
    public Result<List<Doctor>> getDoctorsByDepartment(@PathVariable Long departmentId) {
        return Result.success(doctorService.getDoctorsByDepartment(departmentId));
    }

    @GetMapping("/{id}")
    public Result<Doctor> getDoctorById(@PathVariable Long id) {
        return doctorService.getDoctorById(id)
                .map(Result::success)
                .orElse(Result.error("医生不存在"));
    }

    @PostMapping
    public Result<Doctor> createDoctor(@RequestBody Doctor doctor) {
        try {
            return Result.success(doctorService.createDoctor(doctor));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        try {
            return Result.success(doctorService.updateDoctor(id, doctor));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return Result.success();
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
