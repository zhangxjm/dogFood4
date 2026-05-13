package com.supermarket.controller;

import com.supermarket.common.Result;
import com.supermarket.entity.Category;
import com.supermarket.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public Result<List<Category>> list() {
        List<Category> categories = categoryService.findAll();
        return Result.success(categories);
    }

    @GetMapping("/{id}")
    public Result<Category> getById(@PathVariable Long id) {
        Category category = categoryService.findById(id);
        return Result.success(category);
    }

    @PostMapping
    public Result<Category> save(@RequestBody Category category) {
        Category saved = categoryService.save(category);
        return Result.success(saved);
    }

    @PutMapping("/{id}")
    public Result<Category> update(@PathVariable Long id, @RequestBody Category category) {
        Category updated = categoryService.update(id, category);
        return Result.success(updated);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return Result.success();
    }
}
