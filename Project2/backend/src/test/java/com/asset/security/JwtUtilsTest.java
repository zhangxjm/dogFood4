package com.asset.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class JwtUtilsTest {

    @InjectMocks
    private JwtUtils jwtUtils;

    private static final String TEST_SECRET = "test_secret_key_that_is_at_least_256_bits_long_for_hs256";
    private static final long TEST_EXPIRATION = 86400000;
    private static final String TEST_PREFIX = "Bearer";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpiration", TEST_EXPIRATION);
        ReflectionTestUtils.setField(jwtUtils, "jwtPrefix", TEST_PREFIX);
    }

    @Test
    void testGenerateToken() {
        String token = jwtUtils.generateToken("testuser");
        
        assertNotNull(token);
        assertTrue(token.length() > 0);
    }

    @Test
    void testGetUsernameFromToken() {
        String username = "testuser";
        String token = jwtUtils.generateToken(username);
        
        String extractedUsername = jwtUtils.getUsernameFromToken(token);
        
        assertEquals(username, extractedUsername);
    }

    @Test
    void testValidateToken_Valid() {
        String token = jwtUtils.generateToken("testuser");
        
        boolean isValid = jwtUtils.validateToken(token);
        
        assertTrue(isValid);
    }

    @Test
    void testValidateToken_Invalid() {
        boolean isValid = jwtUtils.validateToken("invalid.token.here");
        
        assertFalse(isValid);
    }

    @Test
    void testValidateToken_Null() {
        boolean isValid = jwtUtils.validateToken(null);
        
        assertFalse(isValid);
    }

    @Test
    void testGetJwtPrefix() {
        String prefix = jwtUtils.getJwtPrefix();
        
        assertEquals(TEST_PREFIX, prefix);
    }

    @Test
    void testTokenConsistency() {
        String token1 = jwtUtils.generateToken("user1");
        String token2 = jwtUtils.generateToken("user1");
        
        String user1FromToken1 = jwtUtils.getUsernameFromToken(token1);
        String user1FromToken2 = jwtUtils.getUsernameFromToken(token2);
        
        assertEquals(user1FromToken1, user1FromToken2);
    }
}
