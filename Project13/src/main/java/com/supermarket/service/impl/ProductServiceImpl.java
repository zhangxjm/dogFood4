package com.supermarket.service.impl;

import com.supermarket.dto.ProductDTO;
import com.supermarket.entity.Category;
import com.supermarket.entity.Product;
import com.supermarket.repository.CategoryRepository;
import com.supermarket.repository.ProductRepository;
import com.supermarket.service.ProductService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public List<Product> findAll() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> search(String name, Long categoryId) {
        if ((name == null || name.trim().isEmpty()) && categoryId == null) {
            return findAll();
        }
        if (name != null && !name.trim().isEmpty() && categoryId != null) {
            return productRepository.findByNameContainingAndCategoryId(name.trim(), categoryId);
        }
        if (name != null && !name.trim().isEmpty()) {
            return productRepository.findByNameContaining(name.trim());
        }
        return productRepository.findByCategoryId(categoryId);
    }

    @Override
    public Product findById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("商品不存在"));
    }

    @Override
    public Product save(ProductDTO dto) {
        Product product = new Product();
        BeanUtils.copyProperties(dto, product);
        product.setStock(dto.getStock() != null ? dto.getStock() : 0);
        
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            product.setCategory(category);
        }
        return productRepository.save(product);
    }

    @Override
    public Product update(Long id, ProductDTO dto) {
        Product product = findById(id);
        BeanUtils.copyProperties(dto, product, "id", "stock", "createTime", "updateTime");
        
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            product.setCategory(category);
        }
        return productRepository.save(product);
    }

    @Override
    public void delete(Long id) {
        productRepository.deleteById(id);
    }

    @Override
    public Product updateStock(Long productId, Integer quantity) {
        Product product = findById(productId);
        int newStock = (product.getStock() != null ? product.getStock() : 0) + quantity;
        if (newStock < 0) {
            throw new RuntimeException("库存不能为负数");
        }
        product.setStock(newStock);
        return productRepository.save(product);
    }
}
