package com.milktea.pos.service;

import com.milktea.pos.entity.Product;
import com.milktea.pos.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @PostConstruct
    public void initProducts() {
        if (productRepository.count() == 0) {
            String[][] products = {
                {"珍珠奶茶", "12", "奶茶"},
                {"波霸奶茶", "13", "奶茶"},
                {"芋泥奶茶", "15", "奶茶"},
                {"红豆奶茶", "14", "奶茶"},
                {"布丁奶茶", "14", "奶茶"},
                {"椰果奶茶", "13", "奶茶"},
                {"满杯水果茶", "18", "果茶"},
                {"柠檬绿茶", "12", "果茶"},
                {"百香果果茶", "16", "果茶"},
                {"芒果多多", "17", "果茶"},
                {"芝士奶盖", "16", "奶盖"},
                {"奥利奥奶盖", "18", "奶盖"},
                {"抹茶拿铁", "16", "咖啡"},
                {"焦糖玛奇朵", "18", "咖啡"},
                {"美式咖啡", "12", "咖啡"}
            };

            for (String[] p : products) {
                Product product = new Product();
                product.setName(p[0]);
                product.setPrice(new BigDecimal(p[1]));
                product.setCategory(p[2]);
                product.setAvailable(true);
                productRepository.save(product);
            }
        }
    }

    public List<Product> getAllProducts() {
        return productRepository.findByAvailableTrue();
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }
}
