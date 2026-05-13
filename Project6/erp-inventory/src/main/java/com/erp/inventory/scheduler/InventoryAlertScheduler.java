package com.erp.inventory.scheduler;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.erp.common.entity.Inventory;
import com.erp.common.entity.InventoryAlert;
import com.erp.inventory.service.InventoryAlertService;
import com.erp.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryAlertScheduler {

    private final InventoryService inventoryService;
    private final InventoryAlertService inventoryAlertService;

    @Scheduled(cron = "0 */30 * * * ?")
    public void checkInventoryAlert() {
        log.info("开始执行库存预警检查...");
        List<Inventory> inventoryList = inventoryService.list();
        
        for (Inventory inventory : inventoryList) {
            Integer available = inventory.getAvailableQuantity();
            
            if (available < 10) {
                LambdaQueryWrapper<InventoryAlert> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(InventoryAlert::getProductId, inventory.getProductId())
                        .eq(InventoryAlert::getStatus, 0)
                        .eq(InventoryAlert::getAlertType, 1);
                long existCount = inventoryAlertService.count(wrapper);
                
                if (existCount == 0) {
                    inventoryAlertService.createAlert(inventory, 1, 10);
                    log.warn("库存不足预警: 商品={}, 当前库存={}", inventory.getProductName(), available);
                }
            }
            
            if (available > 1000) {
                LambdaQueryWrapper<InventoryAlert> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(InventoryAlert::getProductId, inventory.getProductId())
                        .eq(InventoryAlert::getStatus, 0)
                        .eq(InventoryAlert::getAlertType, 2);
                long existCount = inventoryAlertService.count(wrapper);
                
                if (existCount == 0) {
                    inventoryAlertService.createAlert(inventory, 2, 1000);
                    log.warn("库存超量预警: 商品={}, 当前库存={}", inventory.getProductName(), available);
                }
            }
        }
        
        log.info("库存预警检查完成");
    }
}