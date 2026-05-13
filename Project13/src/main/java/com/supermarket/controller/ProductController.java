package com.supermarket.controller;

import com.supermarket.common.Result;
import com.supermarket.dto.ProductDTO;
import com.supermarket.dto.StockDTO;
import com.supermarket.entity.Product;
import com.supermarket.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public Result<List<Product>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId) {
        List<Product> products = productService.search(name, categoryId);
        return Result.success(products);
    }

    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        Product product = productService.findById(id);
        return Result.success(product);
    }

    @PostMapping
    public Result<Product> save(@RequestBody ProductDTO dto) {
        Product product = productService.save(dto);
        return Result.success(product);
    }

    @PutMapping("/{id}")
    public Result<Product> update(@PathVariable Long id, @RequestBody ProductDTO dto) {
        Product product = productService.update(id, dto);
        return Result.success(product);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.success();
    }

    @PutMapping("/stock")
    public Result<Product> updateStock(@RequestBody StockDTO dto) {
        Product product = productService.updateStock(dto.getProductId(), dto.getQuantity());
        return Result.success(product);
    }
}
