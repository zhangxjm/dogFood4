package com.foodorder.dto;

import com.foodorder.entity.Order;
import com.foodorder.entity.OrderItem;
import lombok.Data;
import java.util.List;

@Data
public class OrderDetailVO {
    private Order order;
    private List<OrderItem> items;
    private String tableName;
    private String tableNo;
}
