package com.secondhand.repository;

import com.secondhand.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Product> findByStatusOrderByCreatedAtDesc(String status);

    List<Product> findByCategoryAndStatusOrderByCreatedAtDesc(String category, String status);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
           "(p.title LIKE %:keyword% OR p.description LIKE %:keyword%) " +
           "ORDER BY p.createdAt DESC")
    List<Product> searchByKeyword(@Param("keyword") String keyword, @Param("status") String status);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND p.category = :category " +
           "AND (p.title LIKE %:keyword% OR p.description LIKE %:keyword%) " +
           "ORDER BY p.createdAt DESC")
    List<Product> searchByCategoryAndKeyword(@Param("category") String category,
                                              @Param("keyword") String keyword,
                                              @Param("status") String status);
}
