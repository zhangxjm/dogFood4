package com.asset.controller;

import com.asset.common.PageResult;
import com.asset.common.Result;
import com.asset.entity.OperationLog;
import com.asset.service.OperationLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/operation-logs")
@PreAuthorize("hasRole('ADMIN')")
public class OperationLogController {

    @Autowired
    private OperationLogService operationLogService;

    @GetMapping
    public Result<PageResult<OperationLog>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operation,
            @RequestParam(required = false) Integer status) {
        return Result.success(operationLogService.page(pageNum, pageSize, username, module, operation, status));
    }
}
