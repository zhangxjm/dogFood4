package com.milktea.pos.service;

import com.milktea.pos.dto.DailyReportDTO;
import com.milktea.pos.dto.OrderDTO;
import com.milktea.pos.dto.OrderItemDTO;
import com.milktea.pos.entity.Order;
import com.milktea.pos.entity.OrderItem;
import com.milktea.pos.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public Order createOrder(OrderDTO orderDTO) {
        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setTotalAmount(orderDTO.getTotalAmount());
        order.setDiscountAmount(orderDTO.getDiscountAmount() != null ? orderDTO.getDiscountAmount() : BigDecimal.ZERO);
        order.setPayAmount(orderDTO.getPayAmount());
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setRemark(orderDTO.getRemark());
        order.setCreateTime(LocalDateTime.now());

        for (OrderItemDTO itemDTO : orderDTO.getItems()) {
            OrderItem item = new OrderItem();
            item.setProductId(itemDTO.getProductId());
            item.setProductName(itemDTO.getProductName());
            item.setPrice(itemDTO.getPrice());
            item.setQuantity(itemDTO.getQuantity());
            item.setSugarLevel(itemDTO.getSugarLevel());
            item.setIceLevel(itemDTO.getIceLevel());
            item.setRemark(itemDTO.getRemark());
            order.addItem(item);
        }

        return orderRepository.save(order);
    }

    private String generateOrderNo() {
        return "ORD" + System.currentTimeMillis();
    }

    public Order getOrderByNo(String orderNo) {
        return orderRepository.findByOrderNo(orderNo);
    }

    public List<Order> getOrdersByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);
        return orderRepository.findByCreateTimeBetween(start, end);
    }

    public DailyReportDTO getDailyReport(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(LocalTime.MAX);

        DailyReportDTO report = new DailyReportDTO();
        report.setDate(date.format(DateTimeFormatter.ISO_LOCAL_DATE));
        report.setOrderCount(orderRepository.countByDateRange(start, end));
        report.setTotalAmount(orderRepository.sumPayAmountByDateRange(start, end));
        report.setOrders(getOrdersByDate(date));

        BigDecimal cash = BigDecimal.ZERO;
        BigDecimal wechat = BigDecimal.ZERO;
        BigDecimal alipay = BigDecimal.ZERO;

        for (Order order : report.getOrders()) {
            if ("CASH".equals(order.getPaymentMethod())) {
                cash = cash.add(order.getPayAmount());
            } else if ("WECHAT".equals(order.getPaymentMethod())) {
                wechat = wechat.add(order.getPayAmount());
            } else if ("ALIPAY".equals(order.getPaymentMethod())) {
                alipay = alipay.add(order.getPayAmount());
            }
        }

        report.setCashAmount(cash);
        report.setWechatAmount(wechat);
        report.setAlipayAmount(alipay);

        return report;
    }
}
