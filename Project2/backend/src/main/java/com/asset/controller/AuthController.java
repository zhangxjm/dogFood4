package com.asset.controller;

import com.asset.common.Result;
import com.asset.dto.LoginRequest;
import com.asset.dto.LoginResponse;
import com.asset.entity.User;
import com.asset.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Validated @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @GetMapping("/me")
    public Result<User> getCurrentUser(@AuthenticationPrincipal User user) {
        user.setPassword(null);
        return Result.success(user);
    }
}
