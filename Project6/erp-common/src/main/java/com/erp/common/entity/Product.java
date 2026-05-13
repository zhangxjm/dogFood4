package com.erp.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("product")
public class Product implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String productCode;
    private String productName;
    private Long categoryId;
    private String unit;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private BigDecimal retailPrice;
    private Integer minStock;
    private Integer maxStock;
    private String specification;
    private String brand;
    private String origin;
    private String barcode;
    private String remark;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}