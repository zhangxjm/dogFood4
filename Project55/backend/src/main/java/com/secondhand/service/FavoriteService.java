package com.secondhand.service;

import com.secondhand.entity.Favorite;
import com.secondhand.entity.Product;
import com.secondhand.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ProductService productService;

    public Favorite addFavorite(Long userId, Long productId) {
        if (favoriteRepository.existsByUserIdAndProductId(userId, productId)) {
            return null;
        }
        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setProductId(productId);
        Favorite saved = favoriteRepository.save(favorite);
        updateFavoriteCount(productId);
        return saved;
    }

    @Transactional
    public void removeFavorite(Long userId, Long productId) {
        favoriteRepository.deleteByUserIdAndProductId(userId, productId);
        updateFavoriteCount(productId);
    }

    public boolean isFavorited(Long userId, Long productId) {
        return favoriteRepository.existsByUserIdAndProductId(userId, productId);
    }

    public List<Product> getUserFavorites(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Product> products = new ArrayList<>();
        for (Favorite favorite : favorites) {
            Product product = productService.getProductById(favorite.getProductId());
            if (product != null) {
                products.add(product);
            }
        }
        return products;
    }

    private void updateFavoriteCount(Long productId) {
        int count = favoriteRepository.countByProductId(productId);
        productService.updateFavoriteCount(productId, count);
    }
}
