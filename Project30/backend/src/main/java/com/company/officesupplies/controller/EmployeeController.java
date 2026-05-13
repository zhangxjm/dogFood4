package com.company.officesupplies.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.officesupplies.common.Result;
import com.company.officesupplies.entity.Employee;
import com.company.officesupplies.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/page")
    public Result<Page<Employee>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String department) {
        return Result.success(employeeService.listByPage(page, size, name, department));
    }

    @GetMapping("/list")
    public Result<List<Employee>> list() {
        return Result.success(employeeService.listAll());
    }

    @GetMapping("/{id}")
    public Result<Employee> getById(@PathVariable Long id) {
        return Result.success(employeeService.getById(id));
    }

    @PostMapping
    public Result<Void> add(@RequestBody Employee employee) {
        employeeService.save(employee);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody Employee employee) {
        employeeService.updateById(employee);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        employeeService.removeById(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        employeeService.removeByIds(ids);
        return Result.success();
    }
}
