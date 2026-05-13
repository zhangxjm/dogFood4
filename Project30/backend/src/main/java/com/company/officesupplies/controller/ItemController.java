package com.company.officesupplies.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.officesupplies.common.Result;
import com.company.officesupplies.entity.Item;
import com.company.officesupplies.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping("/page")
    public Result<Page<Item>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId) {
        return Result.success(itemService.listByPage(page, size, name, categoryId));
    }

    @GetMapping("/{id}")
    public Result<Item> getById(@PathVariable Long id) {
        return Result.success(itemService.getById(id));
    }

    @PostMapping
    public Result<Void> add(@RequestBody Item item) {
        if (item.getQuantity() == null) {
            item.setQuantity(0);
        }
        if (item.getMinQuantity() == null) {
            item.setMinQuantity(0);
        }
        if (item.getUnit() == null) {
            item.setUnit("个");
        }
        itemService.save(item);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody Item item) {
        itemService.updateById(item);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        itemService.removeById(id);
        return Result.success();
    }

    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        itemService.removeByIds(ids);
        return Result.success();
    }
}
