package com.milktea.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderDTO {
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal payAmount;
    private String paymentMethod;
    private String remark;
    private List<OrderItemDTO> items;
}
