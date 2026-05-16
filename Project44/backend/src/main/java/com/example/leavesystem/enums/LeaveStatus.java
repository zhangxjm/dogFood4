package com.example.leavesystem.enums;

public enum LeaveStatus {
    PENDING_FIRST("待一级审批"),
    PENDING_SECOND("待二级审批"),
    APPROVED("已通过"),
    REJECTED("已驳回");

    private final String description;

    LeaveStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
