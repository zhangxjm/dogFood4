package com.gym.reservation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservationRequest {
    @NotNull(message = "会员ID不能为空")
    private Long memberId;
    
    @NotNull(message = "课程ID不能为空")
    private Long courseId;
}
