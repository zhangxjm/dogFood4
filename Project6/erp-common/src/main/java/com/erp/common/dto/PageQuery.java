package com.erp.common.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class PageQuery implements Serializable {
    private Integer pageNum = 1;
    private Integer pageSize = 10;
    private String keyword;
    private String orderBy;
    private String orderType;
}