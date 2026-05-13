package com.foodorder.controller;

import com.foodorder.common.Result;
import com.foodorder.dto.CreateOrderRequest;
import com.foodorder.dto.OrderDetailVO;
import com.foodorder.entity.Order;
import com.foodorder.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping
    public Result<OrderDetailVO> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        try {
            return Result.success(orderService.createOrder(request));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PostMapping("/{orderNo}/add")
    public Result<OrderDetailVO> addItems(@PathVariable String orderNo, @Valid @RequestBody CreateOrderRequest request) {
        try {
            return Result.success(orderService.addItems(orderNo, request));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
    
    @GetMapping("/{orderNo}")
    public Result<OrderDetailVO> getOrderByNo(@PathVariable String orderNo) {
        return Result.success(orderService.getOrderByNo(orderNo));
    }
    
    @GetMapping("/pending")
    public Result<List<Order>> getPendingOrders() {
        return Result.success(orderService.getPendingOrders());
    }
    
    @GetMapping("/table/{tableId}")
    public Result<List<Order>> getOrdersByTable(@PathVariable Long tableId) {
        return Result.success(orderService.getOrdersByTable(tableId));
    }
    
    @PutMapping("/{orderNo}/status")
    public Result<Order> updateStatus(@PathVariable String orderNo, @RequestParam String status) {
        try {
            return Result.success(orderService.updateOrderStatus(orderNo, status));
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PutMapping("/{orderNo}/printed")
    public Result<Order> markPrinted(@PathVariable String orderNo) {
        return Result.success(orderService.markKitchenPrinted(orderNo));
    }
    
    @GetMapping("/stats/daily")
    public Result<Map<String, Object>> getDailyStats(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return Result.success(orderService.getDailyStats(date));
    }
}
