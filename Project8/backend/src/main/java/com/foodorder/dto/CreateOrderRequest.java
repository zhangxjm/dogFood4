package com.foodorder.dto;

import lombok.Data;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class CreateOrderRequest {
    @NotNull(message = "桌号不能为空")
    private Long tableId;
    
    private String tableNo;
    
    private Integer customerCount = 1;
    
    private String remark;
    
    @NotEmpty(message = "订单项不能为空")
    private List<OrderItemRequest> items;
}
