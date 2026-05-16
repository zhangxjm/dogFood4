package com.example.leavesystem.enums;

public enum LeaveType {
    SICK("病假"),
    PERSONAL("事假"),
    ANNUAL("年假"),
    OTHER("其他");

    private final String description;

    LeaveType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
