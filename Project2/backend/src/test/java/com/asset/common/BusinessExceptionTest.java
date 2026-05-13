package com.asset.common;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class BusinessExceptionTest {

    @Test
    public void testConstructorWithMessage() {
        String message = "测试业务异常";
        BusinessException exception = new BusinessException(message);
        
        assertEquals(message, exception.getMessage());
        assertEquals(500, exception.getCode());
    }

    @Test
    public void testConstructorWithCodeAndMessage() {
        int code = 400;
        String message = "请求参数错误";
        BusinessException exception = new BusinessException(code, message);
        
        assertEquals(message, exception.getMessage());
        assertEquals(code, exception.getCode());
    }

    @Test
    public void testExceptionIsRuntimeException() {
        BusinessException exception = new BusinessException("test");
        assertTrue(exception instanceof RuntimeException);
    }
}
