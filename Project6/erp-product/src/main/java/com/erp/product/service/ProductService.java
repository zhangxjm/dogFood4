package com.erp.product.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Product;
import com.erp.common.exception.BusinessException;
import com.erp.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService extends ServiceImpl<ProductMapper, Product> {

    @Transactional(rollbackFor = Exception.class)
    public Product saveProduct(Product product) {
        if (!StringUtils.hasText(product.getProductCode())) {
            product.setProductCode("P" + System.currentTimeMillis());
        }
        if (product.getStatus() == null) {
            product.setStatus(1);
        }
        if (product.getMinStock() == null) {
            product.setMinStock(10);
        }
        if (product.getMaxStock() == null) {
            product.setMaxStock(1000);
        }
        save(product);
        log.info("商品创建成功: {}", product.getProductName());
        return product;
    }

    @Transactional(rollbackFor = Exception.class)
    public Product updateProduct(Product product) {
        Product exist = getById(product.getId());
        if (exist == null) {
            throw new BusinessException("商品不存在");
        }
        updateById(product);
        return product;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteProduct(Long id) {
        Product exist = getById(id);
        if (exist == null) {
            throw new BusinessException("商品不存在");
        }
        removeById(id);
    }

    public Product getProductById(Long id) {
        Product product = getById(id);
        if (product == null) {
            throw new BusinessException("商品不存在");
        }
        return product;
    }

    public IPage<Product> pageQuery(PageQuery query) {
        Page<Product> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Product::getProductName, query.getKeyword())
                    .or().like(Product::getProductCode, query.getKeyword());
        }
        wrapper.orderByDesc(Product::getCreateTime);
        return page(page, wrapper);
    }

    public List<Product> listAll() {
        return list();
    }
}