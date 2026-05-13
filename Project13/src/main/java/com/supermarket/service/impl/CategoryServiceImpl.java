package com.supermarket.service.impl;

import com.supermarket.entity.Category;
import com.supermarket.repository.CategoryRepository;
import com.supermarket.service.CategoryService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Override
    public Category findById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("分类不存在"));
    }

    @Override
    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public Category update(Long id, Category category) {
        Category exist = findById(id);
        BeanUtils.copyProperties(category, exist, "id", "createTime");
        return categoryRepository.save(exist);
    }

    @Override
    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}
