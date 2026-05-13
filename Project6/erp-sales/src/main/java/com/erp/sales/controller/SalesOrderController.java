package com.erp.sales.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.SalesOrder;
import com.erp.common.entity.SalesOrderDetail;
import com.erp.common.result.Result;
import com.erp.sales.service.SalesOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @PostMapping
    public Result<SalesOrder> create(@RequestBody OrderCreateRequest request) {
        return Result.success(salesOrderService.createOrder(request.getOrder(), request.getDetails()));
    }

    @PutMapping
    public Result<SalesOrder> update(@RequestBody SalesOrder order) {
        return Result.success(salesOrderService.updateOrder(order));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        salesOrderService.deleteOrder(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<SalesOrder> getById(@PathVariable Long id) {
        return Result.success(salesOrderService.getOrderById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<SalesOrderDetail>> getDetails(@PathVariable Long id) {
        return Result.success(salesOrderService.getOrderDetails(id));
    }

    @PostMapping("/page")
    public Result<IPage<SalesOrder>> page(@RequestBody PageQuery query) {
        return Result.success(salesOrderService.pageQuery(query));
    }

    @Data
    public static class OrderCreateRequest {
        private SalesOrder order;
        private List<SalesOrderDetail> details;
    }
}