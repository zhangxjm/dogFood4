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
import java.util.List;

@Service
public class DepartmentService extends ServiceImpl<DepartmentMapper, Department> {

    @Autowired
    private EmployeeMapper employeeMapper;

    public List<Department> listAll() {
        LambdaQueryWrapper<Department> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Department::getId);
        return list(wrapper);
    }

    public boolean add(Department department) {
        department.setCreateTime(LocalDateTime.now());
        department.setUpdateTime(LocalDateTime.now());
        return save(department);
    }

    public boolean update(Department department) {
        department.setUpdateTime(LocalDateTime.now());
        return updateById(department);
    }

    public boolean delete(Long id) {
        LambdaQueryWrapper<Employee> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Employee::getDepartmentId, id);
        Long count = employeeMapper.selectCount(wrapper);
        if (count > 0) {
            throw new RuntimeException("该部门下还有员工，无法删除");
        }
        return removeById(id);
    }
}
