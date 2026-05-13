package com.erp.inventory.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.InventoryAlert;
import com.erp.common.result.Result;
import com.erp.inventory.service.InventoryAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alert")
@RequiredArgsConstructor
public class InventoryAlertController {

    private final InventoryAlertService inventoryAlertService;

    @PutMapping("/{id}/resolve")
    public Result<Void> resolve(@PathVariable Long id) {
        inventoryAlertService.resolveAlert(id);
        return Result.success();
    }

    @PostMapping("/page")
    public Result<IPage<InventoryAlert>> page(@RequestBody PageQuery query) {
        return Result.success(inventoryAlertService.pageQuery(query));
    }

    @GetMapping("/unresolved")
    public Result<List<InventoryAlert>> getUnresolved() {
        return Result.success(inventoryAlertService.getUnresolvedAlerts());
    }
}