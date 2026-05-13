package com.asset.common;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ResultTest {

    @Test
    public void testSuccess() {
        Result<Object> result = Result.success();
        assertEquals(200, result.getCode());
        assertEquals("操作成功", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    public void testSuccessWithData() {
        String data = "test data";
        Result<String> result = Result.success(data);
        assertEquals(200, result.getCode());
        assertEquals("操作成功", result.getMessage());
        assertEquals(data, result.getData());
    }

    @Test
    public void testSuccessWithMessageAndData() {
        String message = "自定义成功消息";
        String data = "test data";
        Result<String> result = Result.success(message, data);
        assertEquals(200, result.getCode());
        assertEquals(message, result.getMessage());
        assertEquals(data, result.getData());
    }

    @Test
    public void testError() {
        String errorMsg = "测试错误";
        Result<Object> result = Result.error(errorMsg);
        assertEquals(500, result.getCode());
        assertEquals(errorMsg, result.getMessage());
        assertNull(result.getData());
    }

    @Test
    public void testErrorWithCode() {
        int code = 404;
        String errorMsg = "未找到";
        Result<Object> result = Result.error(code, errorMsg);
        assertEquals(code, result.getCode());
        assertEquals(errorMsg, result.getMessage());
        assertNull(result.getData());
    }
}
