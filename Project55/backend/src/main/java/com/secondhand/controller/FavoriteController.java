package com.secondhand.controller;

import com.secondhand.entity.Favorite;
import com.secondhand.entity.Product;
import com.secondhand.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> addFavorite(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        Map<String, Object> result = new HashMap<>();
        Favorite favorite = favoriteService.addFavorite(userId, productId);
        if (favorite != null) {
            result.put("success", true);
            result.put("message", "收藏成功");
            result.put("data", favorite);
        } else {
            result.put("success", false);
            result.put("message", "已收藏");
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        Map<String, Object> result = new HashMap<>();
        favoriteService.removeFavorite(userId, productId);
        result.put("success", true);
        result.put("message", "取消收藏成功");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> isFavorited(
            @RequestParam Long userId,
            @RequestParam Long productId) {
        Map<String, Object> result = new HashMap<>();
        boolean favorited = favoriteService.isFavorited(userId, productId);
        result.put("success", true);
        result.put("data", favorited);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserFavorites(@PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        List<Product> products = favoriteService.getUserFavorites(userId);
        result.put("success", true);
        result.put("data", products);
        return ResponseEntity.ok(result);
    }
}
