package com.supermarket.service;

import com.supermarket.dto.ProductDTO;
import com.supermarket.entity.Product;

import java.util.List;

public interface ProductService {
    List<Product> findAll();
    List<Product> search(String name, Long categoryId);
    Product findById(Long id);
    Product save(ProductDTO dto);
    Product update(Long id, ProductDTO dto);
    void delete(Long id);
    Product updateStock(Long productId, Integer quantity);
}
