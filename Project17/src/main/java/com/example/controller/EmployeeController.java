package com.example.controller;

import com.example.common.Result;
import com.example.entity.Employee;
import com.example.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/list")
    public Result<List<Employee>> list() {
        return Result.success(employeeService.listAll());
    }

    @GetMapping("/search")
    public Result<List<Employee>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status) {
        return Result.success(employeeService.search(name, departmentId, status));
    }

    @GetMapping("/{id}")
    public Result<Employee> getById(@PathVariable Long id) {
        return Result.success(employeeService.getById(id));
    }

    @PostMapping
    public Result<String> add(@RequestBody Employee employee) {
        boolean success = employeeService.add(employee);
        return success ? Result.success("添加成功") : Result.error("添加失败");
    }

    @PutMapping
    public Result<String> update(@RequestBody Employee employee) {
        boolean success = employeeService.update(employee);
        return success ? Result.success("更新成功") : Result.error("更新失败");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean success = employeeService.delete(id);
        return success ? Result.success("删除成功") : Result.error("删除失败");
    }
}
