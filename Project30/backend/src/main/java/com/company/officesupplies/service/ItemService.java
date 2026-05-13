package com.company.officesupplies.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.company.officesupplies.entity.Category;
import com.company.officesupplies.entity.Item;
import com.company.officesupplies.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ItemService extends ServiceImpl<ItemMapper, Item> {

    @Autowired
    private CategoryService categoryService;

    public Page<Item> listByPage(int page, int size, String name, Long categoryId) {
        Page<Item> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Item> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(name)) {
            wrapper.like(Item::getName, name);
        }
        if (categoryId != null) {
            wrapper.eq(Item::getCategoryId, categoryId);
        }
        wrapper.orderByDesc(Item::getCreateTime);
        Page<Item> result = this.page(pageParam, wrapper);
        
        setCategoryNames(result.getRecords());
        return result;
    }

    @Transactional
    public void decreaseStock(Long itemId, int quantity) {
        Item item = this.getById(itemId);
        if (item == null) {
            throw new RuntimeException("物品不存在");
        }
        if (item.getQuantity() < quantity) {
            throw new RuntimeException("库存不足，当前库存：" + item.getQuantity());
        }
        item.setQuantity(item.getQuantity() - quantity);
        this.updateById(item);
    }

    @Transactional
    public void increaseStock(Long itemId, int quantity) {
        Item item = this.getById(itemId);
        if (item == null) {
            throw new RuntimeException("物品不存在");
        }
        item.setQuantity(item.getQuantity() + quantity);
        this.updateById(item);
    }

    private void setCategoryNames(List<Item> items) {
        if (items == null || items.isEmpty()) {
            return;
        }
        List<Long> categoryIds = items.stream()
                .map(Item::getCategoryId)
                .distinct()
                .collect(Collectors.toList());
        List<Category> categories = categoryService.listByIds(categoryIds);
        Map<Long, String> categoryMap = categories.stream()
                .collect(Collectors.toMap(Category::getId, Category::getName));
        items.forEach(item -> item.setCategoryName(categoryMap.get(item.getCategoryId())));
    }
}
