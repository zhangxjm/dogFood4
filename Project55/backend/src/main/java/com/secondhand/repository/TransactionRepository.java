package com.secondhand.repository;

import com.secondhand.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    List<Transaction> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    Transaction findByOrderNo(String orderNo);
}
