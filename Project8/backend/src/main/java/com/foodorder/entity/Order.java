package com.foodorder.entity;

import lombok.Data;
import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "order_no", unique = true, nullable = false, length = 32)
    private String orderNo;
    
    @Column(name = "table_id", nullable = false)
    private Long tableId;
    
    @Column(name = "customer_count")
    private Integer customerCount = 1;
    
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;
    
    @Column(name = "pay_amount", precision = 10, scale = 2)
    private BigDecimal payAmount = BigDecimal.ZERO;
    
    private String status = "PENDING";
    
    @Column(length = 255)
    private String remark;
    
    @Column(name = "kitchen_printed")
    private Boolean kitchenPrinted = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
