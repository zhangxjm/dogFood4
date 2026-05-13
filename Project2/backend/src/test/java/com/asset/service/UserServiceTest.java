package com.asset.service;

import com.asset.common.BusinessException;
import com.asset.common.PageResult;
import com.asset.entity.User;
import com.asset.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setRealName("测试用户");
        testUser.setRole("EMPLOYEE");
        testUser.setStatus(1);
        testUser.setCreateTime(LocalDateTime.now());
    }

    @Test
    void testPage() {
        Page<User> mockPage = new Page<>();
        mockPage.setTotal(2L);
        mockPage.setRecords(Arrays.asList(testUser, testUser));

        when(userMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(mockPage);

        PageResult<User> result = userService.page(1, 10, null, null, null, null);

        assertNotNull(result);
        assertEquals(2L, result.getTotal());
        assertEquals(2, result.getRecords().size());
        assertEquals(1, result.getPageNum());
        assertEquals(10, result.getPageSize());
    }

    @Test
    void testList() {
        when(userMapper.selectList(any(LambdaQueryWrapper.class))).thenReturn(Arrays.asList(testUser));

        List<User> users = userService.list();

        assertNotNull(users);
        assertEquals(1, users.size());
        verify(userMapper).selectList(any(LambdaQueryWrapper.class));
    }

    @Test
    void testGetById_Success() {
        when(userMapper.selectById(1L)).thenReturn(testUser);

        User result = userService.getById(1L);

        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("测试用户", result.getRealName());
    }

    @Test
    void testGetById_NotFound() {
        when(userMapper.selectById(999L)).thenReturn(null);

        assertThrows(BusinessException.class, () -> userService.getById(999L));
    }

    @Test
    void testCreate_Success() {
        User newUser = new User();
        newUser.setUsername("newuser");
        newUser.setPassword("password123");
        newUser.setRealName("新用户");

        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
        when(passwordEncoder.encode("password123")).thenReturn("encodedNewPassword");
        when(userMapper.insert(any(User.class))).thenReturn(1);

        User result = userService.create(newUser);

        assertNotNull(result);
        assertEquals("encodedNewPassword", result.getPassword());
        assertEquals(1, result.getStatus());
    }

    @Test
    void testCreate_DuplicateUsername() {
        User duplicateUser = new User();
        duplicateUser.setUsername("testuser");

        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(testUser);

        assertThrows(BusinessException.class, () -> userService.create(duplicateUser));
    }

    @Test
    void testUpdate_Success() {
        User updateUser = new User();
        updateUser.setId(1L);
        updateUser.setUsername("updatedUser");
        updateUser.setPassword("newPassword");

        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        User result = userService.update(updateUser);

        assertNotNull(result);
        verify(userMapper).updateById(any(User.class));
    }

    @Test
    void testUpdate_UserNotFound() {
        User updateUser = new User();
        updateUser.setId(999L);

        when(userMapper.selectById(999L)).thenReturn(null);

        assertThrows(BusinessException.class, () -> userService.update(updateUser));
    }

    @Test
    void testDelete_Success() {
        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.deleteById(1L)).thenReturn(1);

        userService.delete(1L);

        verify(userMapper).deleteById(1L);
    }

    @Test
    void testDelete_UserNotFound() {
        when(userMapper.selectById(999L)).thenReturn(null);

        assertThrows(BusinessException.class, () -> userService.delete(999L));
    }

    @Test
    void testUpdateStatus() {
        when(userMapper.selectById(1L)).thenReturn(testUser);
        when(userMapper.updateById(any(User.class))).thenReturn(1);

        userService.updateStatus(1L, 0);

        verify(userMapper).updateById(any(User.class));
    }
}
