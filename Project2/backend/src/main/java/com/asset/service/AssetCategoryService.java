package com.asset.service;

import com.asset.common.BusinessException;
import com.asset.entity.AssetCategory;
import com.asset.mapper.AssetCategoryMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssetCategoryService {

    @Autowired
    private AssetCategoryMapper assetCategoryMapper;

    public List<AssetCategory> list() {
        return assetCategoryMapper.selectList(new LambdaQueryWrapper<AssetCategory>()
                .orderByAsc(AssetCategory::getSortOrder));
    }

    public AssetCategory getById(Long id) {
        AssetCategory category = assetCategoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        return category;
    }

    @Transactional
    public AssetCategory create(AssetCategory category) {
        AssetCategory exist = assetCategoryMapper.selectOne(new LambdaQueryWrapper<AssetCategory>()
                .eq(AssetCategory::getCategoryCode, category.getCategoryCode()));
        if (exist != null) {
            throw new BusinessException("分类编码已存在");
        }
        category.setStatus(category.getStatus() != null ? category.getStatus() : 1);
        assetCategoryMapper.insert(category);
        return category;
    }

    @Transactional
    public AssetCategory update(AssetCategory category) {
        getById(category.getId());
        if (category.getCategoryCode() != null) {
            AssetCategory check = assetCategoryMapper.selectOne(new LambdaQueryWrapper<AssetCategory>()
                    .eq(AssetCategory::getCategoryCode, category.getCategoryCode())
                    .ne(AssetCategory::getId, category.getId()));
            if (check != null) {
                throw new BusinessException("分类编码已存在");
            }
        }
        assetCategoryMapper.updateById(category);
        return category;
    }

    @Transactional
    public void delete(Long id) {
        List<AssetCategory> children = assetCategoryMapper.selectList(new LambdaQueryWrapper<AssetCategory>()
                .eq(AssetCategory::getParentId, id));
        if (!children.isEmpty()) {
            throw new BusinessException("存在子分类，不能删除");
        }
        getById(id);
        assetCategoryMapper.deleteById(id);
    }
}
