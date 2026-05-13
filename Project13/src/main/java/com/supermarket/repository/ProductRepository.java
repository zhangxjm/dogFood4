package com.supermarket.repository;

import com.supermarket.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    List<Product> findByNameContaining(String name);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByNameContainingAndCategoryId(String name, Long categoryId);
}
