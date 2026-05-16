package com.milktea.pos.repository;

import com.milktea.pos.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Order findByOrderNo(String orderNo);
    
    @Query("SELECT o FROM Order o WHERE o.createTime BETWEEN :startTime AND :endTime ORDER BY o.createTime DESC")
    List<Order> findByCreateTimeBetween(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT COALESCE(SUM(o.payAmount), 0) FROM Order o WHERE o.createTime BETWEEN :startTime AND :endTime")
    BigDecimal sumPayAmountByDateRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT COALESCE(COUNT(o), 0) FROM Order o WHERE o.createTime BETWEEN :startTime AND :endTime")
    Long countByDateRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);
}
