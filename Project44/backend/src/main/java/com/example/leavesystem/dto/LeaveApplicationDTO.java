package com.example.leavesystem.dto;

import com.example.leavesystem.enums.LeaveType;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class LeaveApplicationDTO {
    @NotNull(message = "请假类型不能为空")
    private LeaveType leaveType;

    @NotNull(message = "开始日期不能为空")
    private LocalDate startDate;

    @NotNull(message = "结束日期不能为空")
    private LocalDate endDate;

    @NotBlank(message = "请假原因不能为空")
    private String reason;
}
