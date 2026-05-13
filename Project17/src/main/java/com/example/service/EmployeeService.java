package com.example.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.entity.Department;
import com.example.entity.Employee;
import com.example.mapper.DepartmentMapper;
import com.example.mapper.EmployeeMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService extends ServiceImpl<EmployeeMapper, Employee> {

    @Autowired
    private DepartmentMapper departmentMapper;

    public List<Employee> listAll() {
        return baseMapper.selectAllWithDepartment();
    }

    public List<Employee> search(String name, Long departmentId, String status) {
        LambdaQueryWrapper<Employee> wrapper = new LambdaQueryWrapper<>();
        if (name != null && !name.isEmpty()) {
            wrapper.like(Employee::getName, name);
        }
        if (departmentId != null) {
            wrapper.eq(Employee::getDepartmentId, departmentId);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Employee::getStatus, status);
        }
        wrapper.orderByDesc(Employee::getId);
        List<Employee> list = list(wrapper);
        Map<Long, String> departmentNameMap = getDepartmentNameMap();
        for (Employee employee : list) {
            fillDepartmentName(employee, departmentNameMap);
        }
        return list;
    }

    public boolean add(Employee employee) {
        employee.setCreateTime(LocalDateTime.now());
        employee.setUpdateTime(LocalDateTime.now());
        return save(employee);
    }

    public boolean update(Employee employee) {
        employee.setUpdateTime(LocalDateTime.now());
        return updateById(employee);
    }

    public boolean delete(Long id) {
        return removeById(id);
    }

    private Map<Long, String> getDepartmentNameMap() {
        Map<Long, String> map = new HashMap<>();
        List<Department> departments = departmentMapper.selectList(null);
        for (Department dept : departments) {
            map.put(dept.getId(), dept.getName());
        }
        return map;
    }

    private void fillDepartmentName(Employee employee, Map<Long, String> departmentNameMap) {
        if (employee.getDepartmentId() != null) {
            employee.setDepartmentName(departmentNameMap.get(employee.getDepartmentId()));
        }
    }
}
