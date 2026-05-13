package com.express.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "packages")
public class Package {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tracking_number", unique = true, nullable = false)
    private String trackingNumber;
    
    @Column(name = "recipient", nullable = false)
    private String recipient;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(name = "express_company")
    private String expressCompany;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private PackageStatus status;
    
    @Column(name = "in_time")
    private LocalDateTime inTime;
    
    @Column(name = "out_time")
    private LocalDateTime outTime;
    
    @Column(name = "operator")
    private String operator;
    
    @Column(name = "out_operator")
    private String outOperator;
    
    @Column(name = "remark")
    private String remark;
    
    @Column(name = "create_time", nullable = false, updatable = false)
    private LocalDateTime createTime;
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        if (status == null) {
            status = PackageStatus.REGISTERED;
        }
    }
    
    public enum PackageStatus {
        REGISTERED("已登记"),
        IN_STORAGE("已入库"),
        PICKED_UP("已取件");
        
        private final String description;
        
        PackageStatus(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
