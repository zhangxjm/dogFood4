package com.erp.purchase.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.PurchaseOrder;
import com.erp.common.entity.PurchaseOrderDetail;
import com.erp.common.result.Result;
import com.erp.purchase.service.PurchaseOrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping
    public Result<PurchaseOrder> create(@RequestBody OrderCreateRequest request) {
        return Result.success(purchaseOrderService.createOrder(request.getOrder(), request.getDetails()));
    }

    @PutMapping
    public Result<PurchaseOrder> update(@RequestBody PurchaseOrder order) {
        return Result.success(purchaseOrderService.updateOrder(order));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        purchaseOrderService.deleteOrder(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<PurchaseOrder> getById(@PathVariable Long id) {
        return Result.success(purchaseOrderService.getOrderById(id));
    }

    @GetMapping("/{id}/details")
    public Result<List<PurchaseOrderDetail>> getDetails(@PathVariable Long id) {
        return Result.success(purchaseOrderService.getOrderDetails(id));
    }

    @PostMapping("/page")
    public Result<IPage<PurchaseOrder>> page(@RequestBody PageQuery query) {
        return Result.success(purchaseOrderService.pageQuery(query));
    }

    @Data
    public static class OrderCreateRequest {
        private PurchaseOrder order;
        private List<PurchaseOrderDetail> details;
    }
}