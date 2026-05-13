package com.asset.service;

import cn.hutool.core.date.DateUtil;
import com.alibaba.excel.EasyExcel;
import com.asset.common.BusinessException;
import com.asset.common.PageResult;
import com.asset.dto.AssetOperationRequest;
import com.asset.entity.Asset;
import com.asset.entity.AssetCategory;
import com.asset.entity.AssetRecord;
import com.asset.entity.User;
import com.asset.mapper.AssetCategoryMapper;
import com.asset.mapper.AssetMapper;
import com.asset.mapper.AssetRecordMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class AssetService {

    @Autowired
    private AssetMapper assetMapper;

    @Autowired
    private AssetRecordMapper assetRecordMapper;

    @Autowired
    private AssetCategoryMapper assetCategoryMapper;

    public PageResult<Asset> page(Integer pageNum, Integer pageSize, String keyword, Long categoryId,
                                  Long deptId, String status, Long userId) {
        Page<Asset> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Asset::getAssetCode, keyword)
                    .or().like(Asset::getAssetName, keyword)
                    .or().like(Asset::getBrand, keyword)
                    .or().like(Asset::getSerialNumber, keyword));
        }
        if (categoryId != null) {
            wrapper.eq(Asset::getCategoryId, categoryId);
        }
        if (deptId != null) {
            wrapper.eq(Asset::getDeptId, deptId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(Asset::getStatus, status);
        }
        if (userId != null) {
            wrapper.eq(Asset::getUserId, userId);
        }
        wrapper.orderByDesc(Asset::getCreateTime);

        Page<Asset> result = assetMapper.selectPage(page, wrapper);
        return PageResult.of(result.getTotal(), result.getRecords(), pageNum, pageSize);
    }

    public Asset getById(Long id) {
        Asset asset = assetMapper.selectById(id);
        if (asset == null) {
            throw new BusinessException("资产不存在");
        }
        calculateDepreciation(asset);
        return asset;
    }

    private void calculateDepreciation(Asset asset) {
        if (asset.getPurchaseDate() == null || asset.getPurchasePrice() == null
                || asset.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        AssetCategory category = assetCategoryMapper.selectById(asset.getCategoryId());
        if (category == null || category.getDepreciationRate() == null
                || category.getDepreciationRate().compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        long months = ChronoUnit.MONTHS.between(asset.getPurchaseDate(), LocalDate.now());
        months = Math.max(months, 0);

        BigDecimal monthlyRate = category.getDepreciationRate().divide(BigDecimal.valueOf(12), 4, RoundingMode.HALF_UP);
        BigDecimal depreciation = asset.getPurchasePrice().multiply(monthlyRate)
                .multiply(BigDecimal.valueOf(months)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal maxDepreciation = asset.getPurchasePrice().multiply(BigDecimal.valueOf(0.95));
        if (depreciation.compareTo(maxDepreciation) > 0) {
            depreciation = maxDepreciation;
        }

        asset.setDepreciationValue(depreciation);
        asset.setCurrentValue(asset.getPurchasePrice().subtract(depreciation));
    }

    @Transactional
    public Asset create(Asset asset) {
        Asset exist = assetMapper.selectOne(new LambdaQueryWrapper<Asset>()
                .eq(Asset::getAssetCode, asset.getAssetCode()));
        if (exist != null) {
            throw new BusinessException("资产编号已存在");
        }
        if (asset.getPurchasePrice() != null) {
            asset.setCurrentValue(asset.getPurchasePrice());
            asset.setDepreciationValue(BigDecimal.ZERO);
        }
        asset.setStatus(asset.getStatus() != null ? asset.getStatus() : "STORED");
        assetMapper.insert(asset);
        return asset;
    }

    @Transactional
    public Asset update(Asset asset) {
        Asset exist = getById(asset.getId());
        if (asset.getAssetCode() != null) {
            Asset check = assetMapper.selectOne(new LambdaQueryWrapper<Asset>()
                    .eq(Asset::getAssetCode, asset.getAssetCode())
                    .ne(Asset::getId, asset.getId()));
            if (check != null) {
                throw new BusinessException("资产编号已存在");
            }
        }
        assetMapper.updateById(asset);
        return asset;
    }

    @Transactional
    public void delete(Long id) {
        getById(id);
        assetMapper.deleteById(id);
    }

    @Transactional
    public void receive(AssetOperationRequest request, User operator) {
        Asset asset = getById(request.getAssetId());
        if (!"STORED".equals(asset.getStatus())) {
            throw new BusinessException("资产不在库中，无法领用");
        }

        asset.setStatus("IN_USE");
        asset.setUserId(request.getTargetUserId() != null ? request.getTargetUserId() : operator.getId());
        if (request.getDeptId() != null) {
            asset.setDeptId(request.getDeptId());
        }
        assetMapper.updateById(asset);

        AssetRecord record = new AssetRecord();
        record.setAssetId(asset.getId());
        record.setOperationType("OUT");
        record.setOperationDate(LocalDateTime.now());
        record.setOperatorId(operator.getId());
        record.setTargetUserId(request.getTargetUserId() != null ? request.getTargetUserId() : operator.getId());
        record.setDeptId(request.getDeptId());
        record.setRemark(request.getRemark());
        record.setQuantity(1);
        assetRecordMapper.insert(record);
    }

    @Transactional
    public void returnAsset(AssetOperationRequest request, User operator) {
        Asset asset = getById(request.getAssetId());
        if (!"IN_USE".equals(asset.getStatus())) {
            throw new BusinessException("资产未被领用，无法归还");
        }

        asset.setStatus("STORED");
        asset.setUserId(null);
        assetMapper.updateById(asset);

        AssetRecord record = new AssetRecord();
        record.setAssetId(asset.getId());
        record.setOperationType("RETURN");
        record.setOperationDate(LocalDateTime.now());
        record.setOperatorId(operator.getId());
        record.setTargetUserId(request.getTargetUserId());
        record.setRemark(request.getRemark());
        record.setQuantity(1);
        assetRecordMapper.insert(record);
    }

    @Transactional
    public void scrap(AssetOperationRequest request, User operator) {
        Asset asset = getById(request.getAssetId());
        if ("SCRAPPED".equals(asset.getStatus())) {
            throw new BusinessException("资产已报废");
        }

        asset.setStatus("SCRAPPED");
        assetMapper.updateById(asset);

        AssetRecord record = new AssetRecord();
        record.setAssetId(asset.getId());
        record.setOperationType("SCRAP");
        record.setOperationDate(LocalDateTime.now());
        record.setOperatorId(operator.getId());
        record.setRemark(request.getRemark());
        record.setQuantity(1);
        assetRecordMapper.insert(record);
    }

    public PageResult<AssetRecord> records(Integer pageNum, Integer pageSize, Long assetId, String operationType,
                                           Long operatorId) {
        Page<AssetRecord> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<AssetRecord> wrapper = new LambdaQueryWrapper<>();
        if (assetId != null) {
            wrapper.eq(AssetRecord::getAssetId, assetId);
        }
        if (StringUtils.hasText(operationType)) {
            wrapper.eq(AssetRecord::getOperationType, operationType);
        }
        if (operatorId != null) {
            wrapper.eq(AssetRecord::getOperatorId, operatorId);
        }
        wrapper.orderByDesc(AssetRecord::getOperationDate);

        Page<AssetRecord> result = assetRecordMapper.selectPage(page, wrapper);
        return PageResult.of(result.getTotal(), result.getRecords(), pageNum, pageSize);
    }

    public void export(HttpServletResponse response, String keyword, Long categoryId, Long deptId, String status) throws IOException {
        LambdaQueryWrapper<Asset> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Asset::getAssetCode, keyword)
                    .or().like(Asset::getAssetName, keyword));
        }
        if (categoryId != null) {
            wrapper.eq(Asset::getCategoryId, categoryId);
        }
        if (deptId != null) {
            wrapper.eq(Asset::getDeptId, deptId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(Asset::getStatus, status);
        }

        List<Asset> assets = assetMapper.selectList(wrapper);
        assets.forEach(this::calculateDepreciation);

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        String fileName = URLEncoder.encode("资产报表_" + DateUtil.format(LocalDateTime.now(), "yyyyMMddHHmmss"), StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

        EasyExcel.write(response.getOutputStream(), Asset.class)
                .sheet("资产列表")
                .doWrite(assets);
    }

    public java.util.Map<String, Object> statistics() {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", assetMapper.selectCount(null));
        stats.put("stored", assetMapper.selectCount(new LambdaQueryWrapper<Asset>().eq(Asset::getStatus, "STORED")));
        stats.put("inUse", assetMapper.selectCount(new LambdaQueryWrapper<Asset>().eq(Asset::getStatus, "IN_USE")));
        stats.put("scrapped", assetMapper.selectCount(new LambdaQueryWrapper<Asset>().eq(Asset::getStatus, "SCRAPPED")));

        List<Asset> assets = assetMapper.selectList(null);
        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalDepreciation = BigDecimal.ZERO;
        for (Asset asset : assets) {
            calculateDepreciation(asset);
            totalValue = totalValue.add(asset.getCurrentValue() != null ? asset.getCurrentValue() : BigDecimal.ZERO);
            totalDepreciation = totalDepreciation.add(asset.getDepreciationValue() != null ? asset.getDepreciationValue() : BigDecimal.ZERO);
        }
        stats.put("totalValue", totalValue);
        stats.put("totalDepreciation", totalDepreciation);

        return stats;
    }
}
