package com.hospital.registration.service;

import com.hospital.registration.entity.Doctor;
import com.hospital.registration.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {
    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findByStatusTrue();
    }

    public List<Doctor> getDoctorsByDepartment(Long departmentId) {
        return doctorRepository.findByDepartmentIdAndStatusTrue(departmentId);
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    @Transactional
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("医生不存在"));
        
        doctor.setName(doctorDetails.getName());
        doctor.setDepartment(doctorDetails.getDepartment());
        doctor.setTitle(doctorDetails.getTitle());
        doctor.setSpecialty(doctorDetails.getSpecialty());
        doctor.setStatus(doctorDetails.getStatus());
        
        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("医生不存在"));
        doctor.setStatus(false);
        doctorRepository.save(doctor);
    }
}
