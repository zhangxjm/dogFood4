package com.erp.inventory.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Warehouse;
import com.erp.common.result.Result;
import com.erp.inventory.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    public Result<Warehouse> save(@RequestBody Warehouse warehouse) {
        return Result.success(warehouseService.saveWarehouse(warehouse));
    }

    @PutMapping
    public Result<Warehouse> update(@RequestBody Warehouse warehouse) {
        return Result.success(warehouseService.updateWarehouse(warehouse));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Warehouse> getById(@PathVariable Long id) {
        return Result.success(warehouseService.getWarehouseById(id));
    }

    @PostMapping("/page")
    public Result<IPage<Warehouse>> page(@RequestBody PageQuery query) {
        return Result.success(warehouseService.pageQuery(query));
    }

    @GetMapping("/list")
    public Result<List<Warehouse>> listAll() {
        return Result.success(warehouseService.listAll());
    }
}