package com.erp.sales.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Customer;
import com.erp.common.result.Result;
import com.erp.sales.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    public Result<Customer> save(@RequestBody Customer customer) {
        return Result.success(customerService.saveCustomer(customer));
    }

    @PutMapping
    public Result<Customer> update(@RequestBody Customer customer) {
        return Result.success(customerService.updateCustomer(customer));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Customer> getById(@PathVariable Long id) {
        return Result.success(customerService.getCustomerById(id));
    }

    @PostMapping("/page")
    public Result<IPage<Customer>> page(@RequestBody PageQuery query) {
        return Result.success(customerService.pageQuery(query));
    }

    @GetMapping("/list")
    public Result<List<Customer>> listAll() {
        return Result.success(customerService.listAll());
    }
}