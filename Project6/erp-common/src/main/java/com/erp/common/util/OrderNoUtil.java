package com.erp.common.util;

import cn.hutool.core.util.IdUtil;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class OrderNoUtil {

    private static final String PURCHASE_PREFIX = "PO";
    private static final String SALES_PREFIX = "SO";
    private static final String VOUCHER_PREFIX = "FV";

    public static String generatePurchaseOrderNo() {
        return generateOrderNo(PURCHASE_PREFIX);
    }

    public static String generateSalesOrderNo() {
        return generateOrderNo(SALES_PREFIX);
    }

    public static String generateVoucherNo() {
        return generateOrderNo(VOUCHER_PREFIX);
    }

    private static String generateOrderNo(String prefix) {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = IdUtil.objectId().substring(0, 6).toUpperCase();
        return prefix + date + random;
    }
}