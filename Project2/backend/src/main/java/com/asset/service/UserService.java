package com.asset.service;

import com.asset.common.BusinessException;
import com.asset.common.PageResult;
import com.asset.entity.User;
import com.asset.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public PageResult<User> page(Integer pageNum, Integer pageSize, String keyword, Long deptId, String role, Integer status) {
        Page<User> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(User::getUsername, keyword)
                    .or().like(User::getRealName, keyword)
                    .or().like(User::getPhone, keyword));
        }
        if (deptId != null) {
            wrapper.eq(User::getDeptId, deptId);
        }
        if (StringUtils.hasText(role)) {
            wrapper.eq(User::getRole, role);
        }
        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }
        wrapper.orderByDesc(User::getCreateTime);

        Page<User> result = userMapper.selectPage(page, wrapper);
        return PageResult.of(result.getTotal(), result.getRecords(), pageNum, pageSize);
    }

    public List<User> list() {
        return userMapper.selectList(new LambdaQueryWrapper<User>()
                .eq(User::getStatus, 1)
                .orderByAsc(User::getId));
    }

    public User getById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return user;
    }

    @Transactional
    public User create(User user) {
        User exist = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, user.getUsername()));
        if (exist != null) {
            throw new BusinessException("用户名已存在");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword() != null ? user.getPassword() : "123456"));
        user.setStatus(user.getStatus() != null ? user.getStatus() : 1);
        userMapper.insert(user);
        return user;
    }

    @Transactional
    public User update(User user) {
        User exist = getById(user.getId());
        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(exist.getPassword());
        }
        if (user.getUsername() != null && !user.getUsername().equals(exist.getUsername())) {
            User check = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getUsername, user.getUsername()));
            if (check != null) {
                throw new BusinessException("用户名已存在");
            }
        }
        userMapper.updateById(user);
        return user;
    }

    @Transactional
    public void delete(Long id) {
        getById(id);
        userMapper.deleteById(id);
    }

    @Transactional
    public void updateStatus(Long id, Integer status) {
        User user = getById(id);
        user.setStatus(status);
        userMapper.updateById(user);
    }
}
