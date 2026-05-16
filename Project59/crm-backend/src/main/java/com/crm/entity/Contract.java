package com.crm.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String contractNo;

    @Column(nullable = false)
    private Long customerId;

    @Transient
    private String customerName;

    private Long opportunityId;

    @Column(nullable = false)
    private String name;

    private BigDecimal amount;

    private LocalDateTime signDate;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private String status;

    @Column(length = 1000)
    private String terms;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

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
