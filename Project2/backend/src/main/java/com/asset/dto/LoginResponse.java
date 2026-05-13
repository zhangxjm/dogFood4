package com.asset.dto;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long id;
    private String username;
    private String realName;
    private String role;
    private Long deptId;
    private String avatar;

    public LoginResponse(String token, Long id, String username, String realName, String role, Long deptId, String avatar) {
        this.token = token;
        this.tokenType = "Bearer";
        this.id = id;
        this.username = username;
        this.realName = realName;
        this.role = role;
        this.deptId = deptId;
        this.avatar = avatar;
    }
}
