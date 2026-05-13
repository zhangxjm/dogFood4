package com.example.service;

import com.example.entity.Department;
import com.example.entity.Employee;
import com.example.repository.DepartmentRepository;
import com.example.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<Employee> findAll(String name, Long departmentId) {
        if ((name == null || name.isEmpty()) && departmentId == null) {
            return employeeRepository.findAll();
        } else if (name != null && !name.isEmpty() && departmentId == null) {
            return employeeRepository.findByNameContaining(name);
        } else if ((name == null || name.isEmpty()) && departmentId != null) {
            return employeeRepository.findByDepartmentId(departmentId);
        } else {
            return employeeRepository.findByNameContainingAndDepartmentId(name, departmentId);
        }
    }

    public Optional<Employee> findById(Long id) {
        return employeeRepository.findById(id);
    }

    public Employee save(Employee employee) {
        if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
            Optional<Department> deptOpt = departmentRepository.findById(employee.getDepartment().getId());
            if (deptOpt.isPresent()) {
                employee.setDepartment(deptOpt.get());
            } else {
                employee.setDepartment(null);
            }
        }
        return employeeRepository.save(employee);
    }

    public Employee update(Long id, Employee employee) {
        Optional<Employee> existingOpt = employeeRepository.findById(id);
        if (existingOpt.isPresent()) {
            Employee existing = existingOpt.get();
            existing.setName(employee.getName());
            existing.setGender(employee.getGender());
            existing.setBirthDate(employee.getBirthDate());
            existing.setPhone(employee.getPhone());
            existing.setEmail(employee.getEmail());
            existing.setPosition(employee.getPosition());
            existing.setAddress(employee.getAddress());
            existing.setRemark(employee.getRemark());

            if (employee.getDepartment() != null && employee.getDepartment().getId() != null) {
                Optional<Department> deptOpt = departmentRepository.findById(employee.getDepartment().getId());
                if (deptOpt.isPresent()) {
                    existing.setDepartment(deptOpt.get());
                } else {
                    existing.setDepartment(null);
                }
            } else {
                existing.setDepartment(null);
            }

            return employeeRepository.save(existing);
        }
        return null;
    }

    public boolean deleteById(Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
