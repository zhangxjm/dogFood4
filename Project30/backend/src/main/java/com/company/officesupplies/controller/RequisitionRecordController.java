package com.company.officesupplies.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.company.officesupplies.common.Result;
import com.company.officesupplies.dto.RequisitionDTO;
import com.company.officesupplies.entity.RequisitionRecord;
import com.company.officesupplies.service.RequisitionRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/requisition")
public class RequisitionRecordController {

    @Autowired
    private RequisitionRecordService requisitionRecordService;

    @GetMapping("/page")
    public Result<Page<RequisitionRecord>> page(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return Result.success(requisitionRecordService.listByPage(page, size, itemId, employeeId, startDate, endDate));
    }

    @GetMapping("/{id}")
    public Result<RequisitionRecord> getById(@PathVariable Long id) {
        return Result.success(requisitionRecordService.getById(id));
    }

    @PostMapping
    public Result<RequisitionRecord> create(@RequestBody @Validated RequisitionDTO dto) {
        try {
            RequisitionRecord record = requisitionRecordService.createRequisition(dto);
            return Result.success("申领成功", record);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
