package com.erp.inventory.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Inventory;
import com.erp.common.result.Result;
import com.erp.inventory.service.InventoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public Result<Inventory> save(@RequestBody Inventory inventory) {
        return Result.success(inventoryService.saveInventory(inventory));
    }

    @PutMapping
    public Result<Inventory> update(@RequestBody Inventory inventory) {
        return Result.success(inventoryService.updateInventory(inventory));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Inventory> getById(@PathVariable Long id) {
        return Result.success(inventoryService.getInventoryById(id));
    }

    @PostMapping("/page")
    public Result<IPage<Inventory>> page(@RequestBody PageQuery query) {
        return Result.success(inventoryService.pageQuery(query));
    }

    @GetMapping("/list")
    public Result<List<Inventory>> listAll() {
        return Result.success(inventoryService.listAll());
    }

    @PostMapping("/increase")
    public Result<Void> increase(@RequestBody StockOperationRequest request) {
        inventoryService.increaseStock(request.getWarehouseId(), request.getProductId(), request.getQuantity());
        return Result.success();
    }

    @PostMapping("/decrease")
    public Result<Void> decrease(@RequestBody StockOperationRequest request) {
        inventoryService.decreaseStock(request.getWarehouseId(), request.getProductId(), request.getQuantity());
        return Result.success();
    }

    @GetMapping("/query")
    public Result<Inventory> getByWarehouseAndProduct(@RequestParam Long warehouseId, @RequestParam Long productId) {
        return Result.success(inventoryService.getByWarehouseAndProduct(warehouseId, productId));
    }

    @Data
    public static class StockOperationRequest {
        private Long warehouseId;
        private Long productId;
        private Integer quantity;
    }
}