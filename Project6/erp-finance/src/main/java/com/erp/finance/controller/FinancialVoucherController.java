package com.erp.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.FinancialVoucher;
import com.erp.common.result.Result;
import com.erp.finance.service.FinancialVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
public class FinancialVoucherController {

    private final FinancialVoucherService financialVoucherService;

    @PostMapping
    public Result<FinancialVoucher> save(@RequestBody FinancialVoucher voucher) {
        return Result.success(financialVoucherService.saveVoucher(voucher));
    }

    @PutMapping
    public Result<FinancialVoucher> update(@RequestBody FinancialVoucher voucher) {
        return Result.success(financialVoucherService.updateVoucher(voucher));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        financialVoucherService.deleteVoucher(id);
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<FinancialVoucher> getById(@PathVariable Long id) {
        return Result.success(financialVoucherService.getVoucherById(id));
    }

    @PostMapping("/page")
    public Result<IPage<FinancialVoucher>> page(@RequestBody PageQuery query) {
        return Result.success(financialVoucherService.pageQuery(query));
    }

    @GetMapping("/order/{orderNo}")
    public Result<List<FinancialVoucher>> getByBusinessOrder(@PathVariable String orderNo) {
        return Result.success(financialVoucherService.getByBusinessOrder(orderNo));
    }
}