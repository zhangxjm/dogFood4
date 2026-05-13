package com.asset.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DtoTest {

    @Test
    void testLoginRequest() {
        LoginRequest request = new LoginRequest();
        request.setUsername("admin");
        request.setPassword("123456");

        assertEquals("admin", request.getUsername());
        assertEquals("123456", request.getPassword());
    }

    @Test
    void testLoginResponse() {
        LoginResponse response = new LoginResponse(
            "test-token",
            1L,
            "admin",
            "超级管理员",
            "ADMIN",
            1L,
            "avatar.png"
        );

        assertEquals("test-token", response.getToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(1L, response.getId());
        assertEquals("admin", response.getUsername());
        assertEquals("超级管理员", response.getRealName());
        assertEquals("ADMIN", response.getRole());
        assertEquals(1L, response.getDeptId());
        assertEquals("avatar.png", response.getAvatar());
    }

    @Test
    void testAssetOperationRequest() {
        AssetOperationRequest request = new AssetOperationRequest();
        request.setAssetId(1L);
        request.setTargetUserId(2L);
        request.setDeptId(1L);
        request.setRemark("测试领用");

        assertEquals(1L, request.getAssetId());
        assertEquals(2L, request.getTargetUserId());
        assertEquals(1L, request.getDeptId());
        assertEquals("测试领用", request.getRemark());
    }

    @Test
    void testLoginRequest_SetNull() {
        LoginRequest request = new LoginRequest();
        request.setUsername(null);
        request.setPassword(null);

        assertNull(request.getUsername());
        assertNull(request.getPassword());
    }

    @Test
    void testAssetOperationRequest_SetNull() {
        AssetOperationRequest request = new AssetOperationRequest();
        request.setAssetId(null);
        request.setTargetUserId(null);
        request.setDeptId(null);
        request.setRemark(null);

        assertNull(request.getAssetId());
        assertNull(request.getTargetUserId());
        assertNull(request.getDeptId());
        assertNull(request.getRemark());
    }
}
