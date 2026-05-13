package com.supermarket.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String code;
    private BigDecimal price;
    private Integer stock;
    private String unit;
    private String description;
    private Long categoryId;
}
