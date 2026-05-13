package com.foodorder.controller;

import com.foodorder.common.Result;
import com.foodorder.entity.Dish;
import com.foodorder.service.DishService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dishes")
public class DishController {
    
    @Autowired
    private DishService dishService;
    
    @GetMapping
    public Result<List<Dish>> getAllDishes() {
        return Result.success(dishService.getAllDishes());
    }
    
    @GetMapping("/category/{categoryId}")
    public Result<List<Dish>> getDishesByCategory(@PathVariable Long categoryId) {
        return Result.success(dishService.getDishesByCategory(categoryId));
    }
    
    @GetMapping("/{id}")
    public Result<Dish> getDishById(@PathVariable Long id) {
        return Result.success(dishService.getDishById(id));
    }
    
    @PostMapping
    public Result<Dish> createDish(@RequestBody Dish dish) {
        return Result.success(dishService.createDish(dish));
    }
    
    @PutMapping("/{id}")
    public Result<Dish> updateDish(@PathVariable Long id, @RequestBody Dish dish) {
        return Result.success(dishService.updateDish(id, dish));
    }
    
    @PutMapping("/{id}/status")
    public Result<Dish> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return Result.success(dishService.updateDishStatus(id, status));
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteDish(@PathVariable Long id) {
        dishService.deleteDish(id);
        return Result.success();
    }
}
