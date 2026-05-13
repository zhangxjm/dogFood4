package com.erp.product.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Category;
import com.erp.common.result.Result;
import com.erp.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public Result<Category> save(@RequestBody Category category) {
        return Result.success(categoryService.saveCategory(category));
    }

    @PutMapping
    public Result<Category> update(@RequestBody Category category) {
        return Result.success(categoryService.updateCategory(category));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Category> getById(@PathVariable Long id) {
        return Result.success(categoryService.getCategoryById(id));
    }

    @PostMapping("/page")
    public Result<IPage<Category>> page(@RequestBody PageQuery query) {
        return Result.success(categoryService.pageQuery(query));
    }

    @GetMapping("/list")
    public Result<List<Category>> listAll() {
        return Result.success(categoryService.listAll());
    }
}