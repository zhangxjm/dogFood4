package com.secondhand.service;

import com.secondhand.entity.Product;
import com.secondhand.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Value("${upload.path}")
    private String uploadPath;

    public List<String> uploadImages(MultipartFile[] files) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                String newFilename = UUID.randomUUID().toString() + extension;
                Path filePath = Paths.get(uploadPath, newFilename);
                Files.write(filePath, file.getBytes());
                imageUrls.add("/uploads/" + newFilename);
            }
        }
        return imageUrls;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product getProductById(Long id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setViewCount(product.getViewCount() + 1);
            productRepository.save(product);
        }
        return product;
    }

    public List<Product> getProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    public List<Product> getAllProducts() {
        return productRepository.findByStatusOrderByCreatedAtDesc("ON_SALE");
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryAndStatusOrderByCreatedAtDesc(category, "ON_SALE");
    }

    public List<Product> searchProducts(String keyword, String category) {
        if (keyword == null || keyword.isEmpty()) {
            if (category == null || category.isEmpty()) {
                return getAllProducts();
            }
            return getProductsByCategory(category);
        }
        if (category == null || category.isEmpty()) {
            return productRepository.searchByKeyword(keyword, "ON_SALE");
        }
        return productRepository.searchByCategoryAndKeyword(category, keyword, "ON_SALE");
    }

    public Product updateProductStatus(Long id, String status) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setStatus(status);
            return productRepository.save(product);
        }
        return null;
    }

    public void updateFavoriteCount(Long productId, int count) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            product.setFavoriteCount(count);
            productRepository.save(product);
        }
    }
}
