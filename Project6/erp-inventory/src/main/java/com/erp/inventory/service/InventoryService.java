package com.erp.inventory.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Inventory;
import com.erp.common.exception.BusinessException;
import com.erp.inventory.mapper.InventoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService extends ServiceImpl<InventoryMapper, Inventory> {

    @Transactional(rollbackFor = Exception.class)
    public Inventory saveInventory(Inventory inventory) {
        if (inventory.getQuantity() == null) {
            inventory.setQuantity(0);
        }
        if (inventory.getLockedQuantity() == null) {
            inventory.setLockedQuantity(0);
        }
        inventory.setAvailableQuantity(inventory.getQuantity() - inventory.getLockedQuantity());
        save(inventory);
        log.info("库存创建成功: {} - {}", inventory.getProductCode(), inventory.getProductName());
        return inventory;
    }

    @Transactional(rollbackFor = Exception.class)
    public Inventory updateInventory(Inventory inventory) {
        Inventory exist = getById(inventory.getId());
        if (exist == null) {
            throw new BusinessException("库存记录不存在");
        }
        if (inventory.getQuantity() != null && inventory.getLockedQuantity() != null) {
            inventory.setAvailableQuantity(inventory.getQuantity() - inventory.getLockedQuantity());
        }
        updateById(inventory);
        return inventory;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteInventory(Long id) {
        Inventory exist = getById(id);
        if (exist == null) {
            throw new BusinessException("库存记录不存在");
        }
        removeById(id);
    }

    public Inventory getInventoryById(Long id) {
        Inventory inventory = getById(id);
        if (inventory == null) {
            throw new BusinessException("库存记录不存在");
        }
        return inventory;
    }

    public IPage<Inventory> pageQuery(PageQuery query) {
        Page<Inventory> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<Inventory> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Inventory::getProductName, query.getKeyword())
                    .or().like(Inventory::getProductCode, query.getKeyword());
        }
        wrapper.orderByDesc(Inventory::getUpdateTime);
        return page(page, wrapper);
    }

    public List<Inventory> listAll() {
        return list();
    }

    @Transactional(rollbackFor = Exception.class)
    public void increaseStock(Long warehouseId, Long productId, Integer quantity) {
        LambdaQueryWrapper<Inventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Inventory::getWarehouseId, warehouseId)
                .eq(Inventory::getProductId, productId);
        Inventory inventory = getOne(wrapper);
        if (inventory == null) {
            inventory = new Inventory();
            inventory.setWarehouseId(warehouseId);
            inventory.setProductId(productId);
            inventory.setQuantity(quantity);
            inventory.setLockedQuantity(0);
            inventory.setAvailableQuantity(quantity);
            save(inventory);
        } else {
            inventory.setQuantity(inventory.getQuantity() + quantity);
            inventory.setAvailableQuantity(inventory.getQuantity() - inventory.getLockedQuantity());
            updateById(inventory);
        }
        log.info("库存增加: 仓库ID={}, 商品ID={}, 数量={}", warehouseId, productId, quantity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void decreaseStock(Long warehouseId, Long productId, Integer quantity) {
        LambdaQueryWrapper<Inventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Inventory::getWarehouseId, warehouseId)
                .eq(Inventory::getProductId, productId);
        Inventory inventory = getOne(wrapper);
        if (inventory == null) {
            throw new BusinessException("库存不足");
        }
        if (inventory.getAvailableQuantity() < quantity) {
            throw new BusinessException("可用库存不足，当前可用: " + inventory.getAvailableQuantity());
        }
        inventory.setQuantity(inventory.getQuantity() - quantity);
        inventory.setAvailableQuantity(inventory.getQuantity() - inventory.getLockedQuantity());
        updateById(inventory);
        log.info("库存减少: 仓库ID={}, 商品ID={}, 数量={}", warehouseId, productId, quantity);
    }

    public Inventory getByWarehouseAndProduct(Long warehouseId, Long productId) {
        LambdaQueryWrapper<Inventory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Inventory::getWarehouseId, warehouseId)
                .eq(Inventory::getProductId, productId);
        return getOne(wrapper);
    }
}