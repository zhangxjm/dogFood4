package com.foodorder.service;

import com.foodorder.dto.CreateOrderRequest;
import com.foodorder.dto.OrderDetailVO;
import com.foodorder.dto.OrderItemRequest;
import com.foodorder.entity.Dish;
import com.foodorder.entity.Order;
import com.foodorder.entity.OrderItem;
import com.foodorder.entity.TableEntity;
import com.foodorder.repository.DishRepository;
import com.foodorder.repository.OrderItemRepository;
import com.foodorder.repository.OrderRepository;
import com.foodorder.repository.TableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private DishRepository dishRepository;
    
    @Autowired
    private TableRepository tableRepository;
    
    @Transactional
    public OrderDetailVO createOrder(CreateOrderRequest request) {
        if (request.getTableId() == null && request.getTableNo() == null) {
            throw new RuntimeException("桌号或桌ID不能为空");
        }
        
        TableEntity table;
        if (request.getTableId() != null) {
            table = tableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("餐桌不存在"));
        } else {
            table = tableRepository.findByTableNo(request.getTableNo())
                    .orElseThrow(() -> new RuntimeException("餐桌不存在"));
        }
        
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setTableId(table.getId());
        order.setCustomerCount(request.getCustomerCount() != null ? request.getCustomerCount() : 1);
        order.setStatus("PENDING");
        order.setRemark(request.getRemark());
        order.setKitchenPrinted(false);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        
        for (OrderItemRequest itemReq : request.getItems()) {
            Dish dish = dishRepository.findById(itemReq.getDishId())
                    .orElseThrow(() -> new RuntimeException("菜品不存在"));
            
            if (!"ON_SALE".equals(dish.getStatus())) {
                throw new RuntimeException("菜品已下架：" + dish.getName());
            }
            
            OrderItem item = new OrderItem();
            item.setDishId(dish.getId());
            item.setDishName(dish.getName());
            item.setQuantity(itemReq.getQuantity());
            item.setPrice(dish.getPrice());
            item.setAmount(dish.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            item.setStatus("PENDING");
            item.setRemark(itemReq.getRemark());
            
            totalAmount = totalAmount.add(item.getAmount());
            orderItems.add(item);
        }
        
        order.setTotalAmount(totalAmount);
        order.setPayAmount(totalAmount);
        
        order = orderRepository.save(order);
        
        for (OrderItem item : orderItems) {
            item.setOrderId(order.getId());
        }
        orderItemRepository.saveAll(orderItems);
        
        table.setStatus("OCCUPIED");
        tableRepository.save(table);
        
        OrderDetailVO vo = new OrderDetailVO();
        vo.setOrder(order);
        vo.setItems(orderItems);
        vo.setTableNo(table.getTableNo());
        vo.setTableName(table.getTableName());
        return vo;
    }
    
    @Transactional
    public OrderDetailVO addItems(String orderNo, CreateOrderRequest request) {
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("订单已完成，无法加菜");
        }
        
        BigDecimal addAmount = BigDecimal.ZERO;
        List<OrderItem> existingItems = orderItemRepository.findByOrderIdOrderByIdAsc(order.getId());
        List<OrderItem> newItems = new ArrayList<>();
        
        for (OrderItemRequest itemReq : request.getItems()) {
            Dish dish = dishRepository.findById(itemReq.getDishId())
                    .orElseThrow(() -> new RuntimeException("菜品不存在"));
            
            Optional<OrderItem> existingOpt = existingItems.stream()
                    .filter(i -> i.getDishId().equals(dish.getId()))
                    .findFirst();
            
            if (existingOpt.isPresent()) {
                OrderItem existing = existingOpt.get();
                BigDecimal oldAmount = existing.getAmount();
                int newQty = existing.getQuantity() + itemReq.getQuantity();
                existing.setQuantity(newQty);
                existing.setAmount(dish.getPrice().multiply(BigDecimal.valueOf(newQty)));
                addAmount = addAmount.add(existing.getAmount().subtract(oldAmount));
            } else {
                OrderItem item = new OrderItem();
                item.setOrderId(order.getId());
                item.setDishId(dish.getId());
                item.setDishName(dish.getName());
                item.setQuantity(itemReq.getQuantity());
                item.setPrice(dish.getPrice());
                item.setAmount(dish.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
                item.setStatus("PENDING");
                item.setRemark(itemReq.getRemark());
                addAmount = addAmount.add(item.getAmount());
                newItems.add(item);
            }
        }
        
        if (!newItems.isEmpty()) {
            orderItemRepository.saveAll(newItems);
        }
        
        order.setTotalAmount(order.getTotalAmount().add(addAmount));
        order.setPayAmount(order.getTotalAmount());
        orderRepository.save(order);
        
        TableEntity table = tableRepository.findById(order.getTableId()).orElse(null);
        
        OrderDetailVO vo = new OrderDetailVO();
        vo.setOrder(order);
        List<OrderItem> allItems = orderItemRepository.findByOrderIdOrderByIdAsc(order.getId());
        vo.setItems(allItems);
        if (table != null) {
            vo.setTableNo(table.getTableNo());
            vo.setTableName(table.getTableName());
        }
        return vo;
    }
    
    public OrderDetailVO getOrderByNo(String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByIdAsc(order.getId());
        TableEntity table = tableRepository.findById(order.getTableId()).orElse(null);
        
        OrderDetailVO vo = new OrderDetailVO();
        vo.setOrder(order);
        vo.setItems(items);
        if (table != null) {
            vo.setTableNo(table.getTableNo());
            vo.setTableName(table.getTableName());
        }
        return vo;
    }
    
    public List<Order> getPendingOrders() {
        return orderRepository.findByStatusInOrderByCreatedAtAsc(
                Arrays.asList("PENDING", "CONFIRMED", "PREPARING")
        );
    }
    
    public List<Order> getOrdersByTable(Long tableId) {
        return orderRepository.findByTableIdAndStatusInOrderByCreatedAtDesc(
                tableId,
                Arrays.asList("PENDING", "CONFIRMED", "PREPARING", "COMPLETED")
        );
    }
    
    @Transactional
    public Order updateOrderStatus(String orderNo, String status) {
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        
        if ("COMPLETED".equals(order.getStatus())) {
            throw new RuntimeException("订单已完成");
        }
        
        order.setStatus(status);
        if ("COMPLETED".equals(status)) {
            order.setPaidAt(LocalDateTime.now());
            TableEntity table = tableRepository.findById(order.getTableId()).orElse(null);
            if (table != null) {
                table.setStatus("AVAILABLE");
                tableRepository.save(table);
            }
        } else if ("CONFIRMED".equals(status)) {
            List<OrderItem> items = orderItemRepository.findByOrderIdOrderByIdAsc(order.getId());
            for (OrderItem item : items) {
                item.setStatus("PREPARING");
            }
            orderItemRepository.saveAll(items);
        }
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order markKitchenPrinted(String orderNo) {
        Order order = orderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new RuntimeException("订单不存在"));
        order.setKitchenPrinted(true);
        return orderRepository.save(order);
    }
    
    public Map<String, Object> getDailyStats(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        
        BigDecimal revenue = orderRepository.sumDailyRevenue(start, end);
        Long orderCount = orderRepository.countDailyOrders(start, end);
        List<Order> orders = orderRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(start, end);
        
        Map<String, Object> result = new HashMap<>();
        result.put("date", date.toString());
        result.put("revenue", revenue != null ? revenue : BigDecimal.ZERO);
        result.put("orderCount", orderCount != null ? orderCount : 0L);
        result.put("orders", orders);
        return result;
    }
    
    private String generateOrderNo() {
        return "FD" + System.currentTimeMillis() + new Random().nextInt(1000);
    }
}
