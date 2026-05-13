package com.asset.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class EntityTest {

    @Test
    void testUserEntity() {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPassword("password");
        user.setRealName("测试用户");
        user.setRole("ADMIN");
        user.setStatus(1);
        user.setPhone("13800138000");
        user.setEmail("test@example.com");
        user.setCreateTime(LocalDateTime.now());

        assertEquals(1L, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("password", user.getPassword());
        assertEquals("测试用户", user.getRealName());
        assertEquals("ADMIN", user.getRole());
        assertEquals(1, user.getStatus());
        assertEquals("13800138000", user.getPhone());
        assertEquals("test@example.com", user.getEmail());
        assertNotNull(user.getCreateTime());
    }

    @Test
    void testAssetEntity() {
        Asset asset = new Asset();
        asset.setId(1L);
        asset.setAssetCode("PC-001");
        asset.setAssetName("测试电脑");
        asset.setBrand("联想");
        asset.setSpec("ThinkPad X1");
        asset.setPurchasePrice(new BigDecimal("8999.00"));
        asset.setCurrentValue(new BigDecimal("8999.00"));
        asset.setStatus("STORED");
        asset.setPurchaseDate(LocalDate.now());

        assertEquals(1L, asset.getId());
        assertEquals("PC-001", asset.getAssetCode());
        assertEquals("测试电脑", asset.getAssetName());
        assertEquals("联想", asset.getBrand());
        assertEquals("ThinkPad X1", asset.getSpec());
        assertEquals(new BigDecimal("8999.00"), asset.getPurchasePrice());
        assertEquals("STORED", asset.getStatus());
    }

    @Test
    void testDepartmentEntity() {
        Department dept = new Department();
        dept.setId(1L);
        dept.setDeptName("技术部");
        dept.setDeptCode("TECH");
        dept.setParentId(0L);
        dept.setDescription("技术部门");
        dept.setStatus(1);

        assertEquals(1L, dept.getId());
        assertEquals("技术部", dept.getDeptName());
        assertEquals("TECH", dept.getDeptCode());
        assertEquals(0L, dept.getParentId());
        assertEquals("技术部门", dept.getDescription());
        assertEquals(1, dept.getStatus());
    }

    @Test
    void testAssetCategoryEntity() {
        AssetCategory category = new AssetCategory();
        category.setId(1L);
        category.setCategoryName("电子设备");
        category.setCategoryCode("ELECTRONIC");
        category.setDepreciationRate(new BigDecimal("16.67"));
        category.setUsefulLife(36);
        category.setStatus(1);

        assertEquals(1L, category.getId());
        assertEquals("电子设备", category.getCategoryName());
        assertEquals("ELECTRONIC", category.getCategoryCode());
        assertEquals(new BigDecimal("16.67"), category.getDepreciationRate());
        assertEquals(36, category.getUsefulLife());
        assertEquals(1, category.getStatus());
    }

    @Test
    void testAssetRecordEntity() {
        AssetRecord record = new AssetRecord();
        record.setId(1L);
        record.setAssetId(1L);
        record.setOperationType("OUT");
        record.setOperatorId(1L);
        record.setTargetUserId(2L);
        record.setRemark("测试领用");
        record.setQuantity(1);

        assertEquals(1L, record.getId());
        assertEquals(1L, record.getAssetId());
        assertEquals("OUT", record.getOperationType());
        assertEquals(1L, record.getOperatorId());
        assertEquals(2L, record.getTargetUserId());
        assertEquals("测试领用", record.getRemark());
        assertEquals(1, record.getQuantity());
    }

    @Test
    void testOperationLogEntity() {
        OperationLog log = new OperationLog();
        log.setId(1L);
        log.setUsername("admin");
        log.setOperation("登录");
        log.setMethod("AuthController.login");
        log.setIp("127.0.0.1");
        log.setCostTime(100L);
        log.setStatus(1);

        assertEquals(1L, log.getId());
        assertEquals("admin", log.getUsername());
        assertEquals("登录", log.getOperation());
        assertEquals("AuthController.login", log.getMethod());
        assertEquals("127.0.0.1", log.getIp());
        assertEquals(100L, log.getCostTime());
        assertEquals(1, log.getStatus());
    }
}
