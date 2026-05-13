package com.foodorder.service;

import com.foodorder.entity.Dish;
import com.foodorder.repository.DishRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DishService {
    
    @Autowired
    private DishRepository dishRepository;
    
    public List<Dish> getAllDishes() {
        return dishRepository.findByStatusOrderBySortOrderAsc("ON_SALE");
    }
    
    public List<Dish> getDishesByCategory(Long categoryId) {
        return dishRepository.findByCategoryIdAndStatusOrderBySortOrderAsc(categoryId, "ON_SALE");
    }
    
    public Dish getDishById(Long id) {
        return dishRepository.findById(id).orElseThrow(() -> new RuntimeException("菜品不存在"));
    }
    
    public Dish createDish(Dish dish) {
        return dishRepository.save(dish);
    }
    
    public Dish updateDish(Long id, Dish dish) {
        Dish existing = getDishById(id);
        existing.setName(dish.getName());
        existing.setDescription(dish.getDescription());
        existing.setPrice(dish.getPrice());
        existing.setCategoryId(dish.getCategoryId());
        if (dish.getImage() != null) {
            existing.setImage(dish.getImage());
        }
        if (dish.getStatus() != null) {
            existing.setStatus(dish.getStatus());
        }
        if (dish.getSortOrder() != null) {
            existing.setSortOrder(dish.getSortOrder());
        }
        return dishRepository.save(existing);
    }
    
    public Dish updateDishStatus(Long id, String status) {
        Dish dish = getDishById(id);
        dish.setStatus(status);
        return dishRepository.save(dish);
    }
    
    public void deleteDish(Long id) {
        dishRepository.deleteById(id);
    }
}
