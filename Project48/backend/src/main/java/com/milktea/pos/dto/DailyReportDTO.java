package com.milktea.pos.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DailyReportDTO {
    private String date;
    private Long orderCount;
    private BigDecimal totalAmount;
    private BigDecimal cashAmount;
    private BigDecimal wechatAmount;
    private BigDecimal alipayAmount;
    private List<com.milktea.pos.entity.Order> orders;
}
