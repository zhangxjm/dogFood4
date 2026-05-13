package com.asset.controller;

import com.asset.common.PageResult;
import com.asset.common.Result;
import com.asset.dto.AssetOperationRequest;
import com.asset.entity.Asset;
import com.asset.entity.AssetRecord;
import com.asset.entity.User;
import com.asset.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public Result<PageResult<Asset>> page(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long deptId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long userId) {
        return Result.success(assetService.page(pageNum, pageSize, keyword, categoryId, deptId, status, userId));
    }

    @GetMapping("/{id}")
    public Result<Asset> getById(@PathVariable Long id) {
        return Result.success(assetService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Asset> create(@RequestBody Asset asset) {
        return Result.success(assetService.create(asset));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Asset> update(@RequestBody Asset asset) {
        return Result.success(assetService.update(asset));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> delete(@PathVariable Long id) {
        assetService.delete(id);
        return Result.success();
    }

    @PostMapping("/receive")
    public Result<Void> receive(@Validated @RequestBody AssetOperationRequest request,
                                @AuthenticationPrincipal User operator) {
        assetService.receive(request, operator);
        return Result.success();
    }

    @PostMapping("/return")
    public Result<Void> returnAsset(@Validated @RequestBody AssetOperationRequest request,
                                    @AuthenticationPrincipal User operator) {
        assetService.returnAsset(request, operator);
        return Result.success();
    }

    @PostMapping("/scrap")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Void> scrap(@Validated @RequestBody AssetOperationRequest request,
                              @AuthenticationPrincipal User operator) {
        assetService.scrap(request, operator);
        return Result.success();
    }

    @GetMapping("/records")
    public Result<PageResult<AssetRecord>> records(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) Long operatorId) {
        return Result.success(assetService.records(pageNum, pageSize, assetId, operationType, operatorId));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public void export(HttpServletResponse response,
                       @RequestParam(required = false) String keyword,
                       @RequestParam(required = false) Long categoryId,
                       @RequestParam(required = false) Long deptId,
                       @RequestParam(required = false) String status) throws IOException {
        assetService.export(response, keyword, categoryId, deptId, status);
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics() {
        return Result.success(assetService.statistics());
    }
}
