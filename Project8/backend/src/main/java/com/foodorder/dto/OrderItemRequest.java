package com.foodorder.dto;

import lombok.Data;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderItemRequest {
    @NotNull(message = "菜品ID不能为空")
    private Long dishId;
    
    private String dishName;
    
    @NotNull(message = "数量不能为空")
    private Integer quantity;
    
    private BigDecimal price;
    
    private String remark;
}
