package com.foodorder.controller;

import com.foodorder.common.Result;
import com.foodorder.entity.TableEntity;
import com.foodorder.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tables")
public class TableController {
    
    @Autowired
    private TableService tableService;
    
    @GetMapping
    public Result<List<TableEntity>> getAllTables() {
        return Result.success(tableService.getAllTables());
    }
    
    @GetMapping("/{id}")
    public Result<TableEntity> getTableById(@PathVariable Long id) {
        return Result.success(tableService.getTableById(id));
    }
    
    @GetMapping("/no/{tableNo}")
    public Result<TableEntity> getTableByNo(@PathVariable String tableNo) {
        return Result.success(tableService.getTableByNo(tableNo));
    }
    
    @PostMapping
    public Result<TableEntity> createTable(@RequestBody TableEntity table) {
        try {
            return Result.success(tableService.createTable(table));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PostMapping("/{id}/regenerate-qrcode")
    public Result<TableEntity> regenerateQRCode(@PathVariable Long id) {
        try {
            return Result.success(tableService.regenerateQRCode(id));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/status")
    public Result<TableEntity> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return Result.success(tableService.updateTableStatus(id, status));
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return Result.success();
    }
}
