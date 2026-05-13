package com.example.service;

import com.example.entity.Department;
import com.example.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> findAll() {
        return departmentRepository.findAll();
    }

    public Optional<Department> findById(Long id) {
        return departmentRepository.findById(id);
    }

    public Department save(Department department) {
        return departmentRepository.save(department);
    }

    public Department update(Long id, Department department) {
        Optional<Department> existingOpt = departmentRepository.findById(id);
        if (existingOpt.isPresent()) {
            Department existing = existingOpt.get();
            existing.setName(department.getName());
            existing.setDescription(department.getDescription());
            return departmentRepository.save(existing);
        }
        return null;
    }

    public boolean deleteById(Long id) {
        if (departmentRepository.existsById(id)) {
            departmentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
