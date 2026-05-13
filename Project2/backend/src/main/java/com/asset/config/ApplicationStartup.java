package com.asset.config;

import com.asset.entity.User;
import com.asset.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class ApplicationStartup {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void initUsers() {
        try {
            initUser("admin", "123456", "超级管理员", "13800000000", "admin@company.com", 1L, "ADMIN");
            initUser("admin_dept", "123456", "行政管理员", "13800000001", "admin_dept@company.com", 2L, "ADMIN");
            initUser("employee1", "123456", "张三", "13800000002", "zhangsan@company.com", 3L, "EMPLOYEE");
            initUser("employee2", "123456", "李四", "13800000003", "lisi@company.com", 3L, "EMPLOYEE");
            initUser("employee3", "123456", "王五", "13800000004", "wangwu@company.com", 4L, "EMPLOYEE");
        } catch (Exception e) {
            System.out.println("用户初始化跳过（可能数据库表还未准备好）");
        }
    }

    private void initUser(String username, String password, String realName, String phone, String email, Long deptId, String role) {
        User exist = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (exist == null) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setRealName(realName);
            user.setPhone(phone);
            user.setEmail(email);
            user.setDeptId(deptId);
            user.setRole(role);
            user.setStatus(1);
            userMapper.insert(user);
            System.out.println("已创建用户: " + username);
        }
    }
}
