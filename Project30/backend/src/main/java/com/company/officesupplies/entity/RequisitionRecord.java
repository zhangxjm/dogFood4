package com.company.officesupplies.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("requisition_record")
public class RequisitionRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long itemId;

    private Long employeeId;

    private Integer quantity;

    private String purpose;

    private LocalDateTime requisitionTime;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private String itemName;

    @TableField(exist = false)
    private String itemUnit;

    @TableField(exist = false)
    private String employeeName;

    @TableField(exist = false)
    private String employeeNo;

    @TableField(exist = false)
    private String department;
}
