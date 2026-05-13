package com.company.officesupplies.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.company.officesupplies.entity.Category;
import com.company.officesupplies.mapper.CategoryMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CategoryService extends ServiceImpl<CategoryMapper, Category> {

    public Page<Category> listByPage(int page, int size, String name) {
        Page<Category> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(name)) {
            wrapper.like(Category::getName, name);
        }
        wrapper.orderByDesc(Category::getCreateTime);
        return this.page(pageParam, wrapper);
    }

    public List<Category> listAll() {
        return this.list(new LambdaQueryWrapper<Category>().orderByAsc(Category::getId));
    }
}
