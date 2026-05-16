package com.secondhand.controller;

import com.secondhand.entity.User;
import com.secondhand.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> result = new HashMap<>();
        User registered = userService.register(user);
        if (registered != null) {
            result.put("success", true);
            result.put("message", "注册成功");
            result.put("data", registered);
        } else {
            result.put("success", false);
            result.put("message", "用户名已存在");
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody User user) {
        Map<String, Object> result = new HashMap<>();
        User loggedIn = userService.login(user.getUsername(), user.getPassword());
        if (loggedIn != null) {
            result.put("success", true);
            result.put("message", "登录成功");
            result.put("data", loggedIn);
        } else {
            result.put("success", false);
            result.put("message", "用户名或密码错误");
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        User user = userService.getUserById(id);
        if (user != null) {
            result.put("success", true);
            result.put("data", user);
        } else {
            result.put("success", false);
            result.put("message", "用户不存在");
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable Long id, @RequestBody User user) {
        Map<String, Object> result = new HashMap<>();
        User updated = userService.updateUser(id, user);
        if (updated != null) {
            result.put("success", true);
            result.put("message", "更新成功");
            result.put("data", updated);
        } else {
            result.put("success", false);
            result.put("message", "更新失败");
        }
        return ResponseEntity.ok(result);
    }
}
