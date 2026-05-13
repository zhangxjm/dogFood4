package com.company.officesupplies.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RequisitionDTO {

    @NotNull(message = "物品ID不能为空")
    private Long itemId;

    @NotNull(message = "员工ID不能为空")
    private Long employeeId;

    @NotNull(message = "申领数量不能为空")
    @Min(value = 1, message = "申领数量至少为1")
    private Integer quantity;

    private String purpose;
}
