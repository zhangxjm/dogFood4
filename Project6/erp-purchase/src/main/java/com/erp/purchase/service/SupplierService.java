package com.erp.purchase.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Supplier;
import com.erp.common.exception.BusinessException;
import com.erp.purchase.mapper.SupplierMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupplierService extends ServiceImpl<SupplierMapper, Supplier> {

    @Transactional(rollbackFor = Exception.class)
    public Supplier saveSupplier(Supplier supplier) {
        if (!StringUtils.hasText(supplier.getSupplierCode())) {
            supplier.setSupplierCode("S" + System.currentTimeMillis());
        }
        if (supplier.getStatus() == null) {
            supplier.setStatus(1);
        }
        save(supplier);
        log.info("供应商创建成功: {}", supplier.getSupplierName());
        return supplier;
    }

    @Transactional(rollbackFor = Exception.class)
    public Supplier updateSupplier(Supplier supplier) {
        Supplier exist = getById(supplier.getId());
        if (exist == null) {
            throw new BusinessException("供应商不存在");
        }
        updateById(supplier);
        return supplier;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteSupplier(Long id) {
        Supplier exist = getById(id);
        if (exist == null) {
            throw new BusinessException("供应商不存在");
        }
        removeById(id);
    }

    public Supplier getSupplierById(Long id) {
        Supplier supplier = getById(id);
        if (supplier == null) {
            throw new BusinessException("供应商不存在");
        }
        return supplier;
    }

    public IPage<Supplier> pageQuery(PageQuery query) {
        Page<Supplier> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<Supplier> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Supplier::getSupplierName, query.getKeyword())
                    .or().like(Supplier::getSupplierCode, query.getKeyword());
        }
        wrapper.orderByDesc(Supplier::getCreateTime);
        return page(page, wrapper);
    }

    public List<Supplier> listAll() {
        return list();
    }
}