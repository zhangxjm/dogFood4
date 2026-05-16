package com.secondhand.controller;

import com.secondhand.entity.Product;
import com.secondhand.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<String> imageUrls = productService.uploadImages(files);
            result.put("success", true);
            result.put("message", "上传成功");
            result.put("data", imageUrls);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "上传失败: " + e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Product product) {
        Map<String, Object> result = new HashMap<>();
        Product created = productService.createProduct(product);
        result.put("success", true);
        result.put("message", "发布成功");
        result.put("data", created);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProductById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        Product product = productService.getProductById(id);
        if (product != null) {
            result.put("success", true);
            result.put("data", product);
        } else {
            result.put("success", false);
            result.put("message", "商品不存在");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long sellerId) {
        Map<String, Object> result = new HashMap<>();
        List<Product> products;
        if (sellerId != null) {
            products = productService.getProductsBySellerId(sellerId);
        } else {
            products = productService.searchProducts(keyword, category);
        }
        result.put("success", true);
        result.put("data", products);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateProductStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Map<String, Object> result = new HashMap<>();
        Product updated = productService.updateProductStatus(id, status);
        if (updated != null) {
            result.put("success", true);
            result.put("message", "更新成功");
            result.put("data", updated);
        } else {
            result.put("success", false);
            result.put("message", "更新失败");
        }
        return ResponseEntity.ok(result);
    }
}
