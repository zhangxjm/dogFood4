package com.hospital.registration.service;

import com.hospital.registration.entity.Department;
import com.hospital.registration.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findByStatusTrueOrderBySortOrderAsc();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    @Transactional
    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new RuntimeException("科室名称已存在");
        }
        return departmentRepository.save(department);
    }

    @Transactional
    public Department updateDepartment(Long id, Department departmentDetails) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("科室不存在"));
        
        if (!department.getName().equals(departmentDetails.getName()) 
                && departmentRepository.existsByName(departmentDetails.getName())) {
            throw new RuntimeException("科室名称已存在");
        }
        
        department.setName(departmentDetails.getName());
        department.setDescription(departmentDetails.getDescription());
        department.setSortOrder(departmentDetails.getSortOrder());
        department.setStatus(departmentDetails.getStatus());
        
        return departmentRepository.save(department);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("科室不存在"));
        department.setStatus(false);
        departmentRepository.save(department);
    }
}
