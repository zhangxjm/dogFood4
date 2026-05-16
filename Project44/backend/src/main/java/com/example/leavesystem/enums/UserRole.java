package com.example.leavesystem.enums;

public enum UserRole {
    STUDENT("学生"),
    TEACHER_FIRST("一级审批老师"),
    TEACHER_SECOND("二级审批老师");

    private final String description;

    UserRole(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
