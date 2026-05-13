package com.erp.purchase.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Supplier;
import com.erp.common.result.Result;
import com.erp.purchase.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public Result<Supplier> save(@RequestBody Supplier supplier) {
        return Result.success(supplierService.saveSupplier(supplier));
    }

    @PutMapping
    public Result<Supplier> update(@RequestBody Supplier supplier) {
        return Result.success(supplierService.updateSupplier(supplier));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Supplier> getById(@PathVariable Long id) {
        return Result.success(supplierService.getSupplierById(id));
    }

    @PostMapping("/page")
    public Result<IPage<Supplier>> page(@RequestBody PageQuery query) {
        return Result.success(supplierService.pageQuery(query));
    }

    @GetMapping("/list")
    public Result<List<Supplier>> listAll() {
        return Result.success(supplierService.listAll());
    }
}