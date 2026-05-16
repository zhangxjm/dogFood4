package com.secondhand.service;

import com.secondhand.entity.Product;
import com.secondhand.entity.Transaction;
import com.secondhand.entity.User;
import com.secondhand.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    public Transaction createTransaction(Long productId, Long buyerId) {
        Product product = productService.getProductById(productId);
        if (product == null || !"ON_SALE".equals(product.getStatus())) {
            return null;
        }

        User buyer = userService.getUserById(buyerId);
        if (buyer == null) {
            return null;
        }

        Transaction transaction = new Transaction();
        String orderNo = "ORD" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) 
                        + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        transaction.setOrderNo(orderNo);
        transaction.setProductId(productId);
        transaction.setProductTitle(product.getTitle());
        if (!product.getImages().isEmpty()) {
            transaction.setProductImage(product.getImages().get(0));
        }
        transaction.setPrice(product.getPrice());
        transaction.setSellerId(product.getSellerId());
        transaction.setSellerName(product.getSellerName());
        transaction.setBuyerId(buyerId);
        transaction.setBuyerName(buyer.getNickname());

        Transaction saved = transactionRepository.save(transaction);
        productService.updateProductStatus(productId, "SOLD");
        return saved;
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public List<Transaction> getBuyerTransactions(Long buyerId) {
        return transactionRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId);
    }

    public List<Transaction> getSellerTransactions(Long sellerId) {
        return transactionRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);
    }

    public Transaction updateTransactionStatus(Long id, String status) {
        Transaction transaction = transactionRepository.findById(id).orElse(null);
        if (transaction != null) {
            transaction.setStatus(status);
            return transactionRepository.save(transaction);
        }
        return null;
    }
}
