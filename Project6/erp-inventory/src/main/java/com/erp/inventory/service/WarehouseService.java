package com.erp.inventory.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Warehouse;
import com.erp.common.exception.BusinessException;
import com.erp.inventory.mapper.WarehouseMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WarehouseService extends ServiceImpl<WarehouseMapper, Warehouse> {

    @Transactional(rollbackFor = Exception.class)
    public Warehouse saveWarehouse(Warehouse warehouse) {
        if (!StringUtils.hasText(warehouse.getWarehouseCode())) {
            warehouse.setWarehouseCode("W" + System.currentTimeMillis());
        }
        if (warehouse.getStatus() == null) {
            warehouse.setStatus(1);
        }
        save(warehouse);
        log.info("仓库创建成功: {}", warehouse.getWarehouseName());
        return warehouse;
    }

    @Transactional(rollbackFor = Exception.class)
    public Warehouse updateWarehouse(Warehouse warehouse) {
        Warehouse exist = getById(warehouse.getId());
        if (exist == null) {
            throw new BusinessException("仓库不存在");
        }
        updateById(warehouse);
        return warehouse;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteWarehouse(Long id) {
        Warehouse exist = getById(id);
        if (exist == null) {
            throw new BusinessException("仓库不存在");
        }
        removeById(id);
    }

    public Warehouse getWarehouseById(Long id) {
        Warehouse warehouse = getById(id);
        if (warehouse == null) {
            throw new BusinessException("仓库不存在");
        }
        return warehouse;
    }

    public IPage<Warehouse> pageQuery(PageQuery query) {
        Page<Warehouse> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<Warehouse> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Warehouse::getWarehouseName, query.getKeyword())
                    .or().like(Warehouse::getWarehouseCode, query.getKeyword());
        }
        wrapper.orderByDesc(Warehouse::getCreateTime);
        return page(page, wrapper);
    }

    public List<Warehouse> listAll() {
        return list();
    }
}