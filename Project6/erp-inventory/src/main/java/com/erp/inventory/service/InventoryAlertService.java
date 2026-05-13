package com.erp.inventory.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Inventory;
import com.erp.common.entity.InventoryAlert;
import com.erp.inventory.mapper.InventoryAlertMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryAlertService extends ServiceImpl<InventoryAlertMapper, InventoryAlert> {

    private final InventoryService inventoryService;

    @Transactional(rollbackFor = Exception.class)
    public void createAlert(Inventory inventory, Integer alertType, Integer threshold) {
        InventoryAlert alert = new InventoryAlert();
        alert.setWarehouseId(inventory.getWarehouseId());
        alert.setProductId(inventory.getProductId());
        alert.setProductCode(inventory.getProductCode());
        alert.setProductName(inventory.getProductName());
        alert.setAlertType(alertType);
        alert.setCurrentStock(inventory.getAvailableQuantity());
        alert.setThreshold(threshold);
        alert.setStatus(0);
        save(alert);
        log.info("库存预警创建: 商品={}, 当前库存={}, 阈值={}", inventory.getProductName(), inventory.getAvailableQuantity(), threshold);
    }

    @Transactional(rollbackFor = Exception.class)
    public void resolveAlert(Long id) {
        InventoryAlert alert = getById(id);
        if (alert != null) {
            alert.setStatus(1);
            updateById(alert);
            log.info("库存预警已处理: ID={}", id);
        }
    }

    public IPage<InventoryAlert> pageQuery(PageQuery query) {
        Page<InventoryAlert> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<InventoryAlert> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(InventoryAlert::getCreateTime);
        return page(page, wrapper);
    }

    public List<InventoryAlert> getUnresolvedAlerts() {
        LambdaQueryWrapper<InventoryAlert> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(InventoryAlert::getStatus, 0)
                .orderByDesc(InventoryAlert::getCreateTime);
        return list(wrapper);
    }
}