package com.foodorder.repository;

import com.foodorder.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNo(String orderNo);
    List<Order> findByTableIdAndStatusInOrderByCreatedAtDesc(Long tableId, List<String> statuses);
    List<Order> findByStatusInOrderByCreatedAtAsc(List<String> statuses);
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COALESCE(SUM(o.payAmount), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.paidAt BETWEEN :start AND :end")
    BigDecimal sumDailyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = 'COMPLETED' AND o.paidAt BETWEEN :start AND :end")
    Long countDailyOrders(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
