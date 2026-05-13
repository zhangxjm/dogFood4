package com.erp.product.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Category;
import com.erp.common.exception.BusinessException;
import com.erp.product.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {

    @Transactional(rollbackFor = Exception.class)
    public Category saveCategory(Category category) {
        if (!StringUtils.hasText(category.getCategoryCode())) {
            category.setCategoryCode("C" + System.currentTimeMillis());
        }
        if (category.getStatus() == null) {
            category.setStatus(1);
        }
        if (category.getSort() == null) {
            category.setSort(0);
        }
        if (category.getParentId() == null) {
            category.setParentId(0L);
        }
        save(category);
        log.info("分类创建成功: {}", category.getCategoryName());
        return category;
    }

    @Transactional(rollbackFor = Exception.class)
    public Category updateCategory(Category category) {
        Category exist = getById(category.getId());
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        updateById(category);
        return category;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) {
        Category exist = getById(id);
        if (exist == null) {
            throw new BusinessException("分类不存在");
        }
        removeById(id);
    }

    public Category getCategoryById(Long id) {
        Category category = getById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        return category;
    }

    public IPage<Category> pageQuery(PageQuery query) {
        Page<Category> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Category::getCategoryName, query.getKeyword())
                    .or().like(Category::getCategoryCode, query.getKeyword());
        }
        wrapper.orderByAsc(Category::getSort);
        return page(page, wrapper);
    }

    public List<Category> listAll() {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByAsc(Category::getSort);
        return list(wrapper);
    }
}