package com.asset.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("assets")
public class Asset {
    @TableId(type = IdType.AUTO)
    private Long id;

    private String assetCode;

    private String assetName;

    private Long categoryId;

    private String spec;

    private String brand;

    private String serialNumber;

    private LocalDate purchaseDate;

    private BigDecimal purchasePrice;

    private BigDecimal currentValue;

    private BigDecimal depreciationValue;

    private String location;

    private Long deptId;

    private Long keeperId;

    private Long userId;

    private String status;

    private String description;

    private String imageUrl;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
