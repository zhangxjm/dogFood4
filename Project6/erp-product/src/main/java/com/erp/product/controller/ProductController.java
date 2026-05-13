package com.erp.product.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Product;
import com.erp.common.result.Result;
import com.erp.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public Result<Product> save(@RequestBody Product product) {
        return Result.success(productService.saveProduct(product));
    }

    @PutMapping
    public Result<Product> update(@RequestBody Product product) {
        return Result.success(productService.updateProduct(product));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }

    @PostMapping("/page")
    public Result<IPage<Product>> page(@RequestBody PageQuery query) {
        return Result.success(productService.pageQuery(query));
    }

    @GetMapping("/list")
    public Result<List<Product>> listAll() {
        return Result.success(productService.listAll());
    }
}