package com.company.officesupplies.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.company.officesupplies.entity.Employee;
import com.company.officesupplies.mapper.EmployeeMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class EmployeeService extends ServiceImpl<EmployeeMapper, Employee> {

    public Page<Employee> listByPage(int page, int size, String name, String department) {
        Page<Employee> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Employee> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(name)) {
            wrapper.like(Employee::getName, name);
        }
        if (StringUtils.hasText(department)) {
            wrapper.like(Employee::getDepartment, department);
        }
        wrapper.orderByDesc(Employee::getCreateTime);
        return this.page(pageParam, wrapper);
    }

    public List<Employee> listAll() {
        return this.list(new LambdaQueryWrapper<Employee>().orderByAsc(Employee::getId));
    }
}
