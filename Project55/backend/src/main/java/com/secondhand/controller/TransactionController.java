package com.secondhand.controller;

import com.secondhand.entity.Transaction;
import com.secondhand.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTransaction(
            @RequestParam Long productId,
            @RequestParam Long buyerId) {
        Map<String, Object> result = new HashMap<>();
        Transaction transaction = transactionService.createTransaction(productId, buyerId);
        if (transaction != null) {
            result.put("success", true);
            result.put("message", "交易创建成功");
            result.put("data", transaction);
        } else {
            result.put("success", false);
            result.put("message", "交易创建失败，商品可能已售出或不存在");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTransactionById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        Transaction transaction = transactionService.getTransactionById(id);
        if (transaction != null) {
            result.put("success", true);
            result.put("data", transaction);
        } else {
            result.put("success", false);
            result.put("message", "交易不存在");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<Map<String, Object>> getBuyerTransactions(@PathVariable Long buyerId) {
        Map<String, Object> result = new HashMap<>();
        List<Transaction> transactions = transactionService.getBuyerTransactions(buyerId);
        result.put("success", true);
        result.put("data", transactions);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<Map<String, Object>> getSellerTransactions(@PathVariable Long sellerId) {
        Map<String, Object> result = new HashMap<>();
        List<Transaction> transactions = transactionService.getSellerTransactions(sellerId);
        result.put("success", true);
        result.put("data", transactions);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateTransactionStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Map<String, Object> result = new HashMap<>();
        Transaction updated = transactionService.updateTransactionStatus(id, status);
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
