package com.asset.controller;

import com.asset.common.Result;
import com.asset.entity.AssetCategory;
import com.asset.service.AssetCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/asset-categories")
public class AssetCategoryController {

    @Autowired
    private AssetCategoryService assetCategoryService;

    @GetMapping
    public Result<List<AssetCategory>> list() {
        return Result.success(assetCategoryService.list());
    }

    @GetMapping("/{id}")
    public Result<AssetCategory> getById(@PathVariable Long id) {
        return Result.success(assetCategoryService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<AssetCategory> create(@RequestBody AssetCategory category) {
        return Result.success(assetCategoryService.create(category));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<AssetCategory> update(@RequestBody AssetCategory category) {
        return Result.success(assetCategoryService.update(category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        assetCategoryService.delete(id);
        return Result.success();
    }
}
