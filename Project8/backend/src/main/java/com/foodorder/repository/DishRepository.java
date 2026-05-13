package com.foodorder.repository;

import com.foodorder.entity.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DishRepository extends JpaRepository<Dish, Long> {
    List<Dish> findByCategoryIdAndStatusOrderBySortOrderAsc(Long categoryId, String status);
    List<Dish> findByStatusOrderBySortOrderAsc(String status);
    List<Dish> findByCategoryIdOrderBySortOrderAsc(Long categoryId);
}
