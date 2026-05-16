package com.milktea.pos.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItemDTO {
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private String sugarLevel;
    private String iceLevel;
    private String remark;
}
