package com.asset.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("asset_records")
public class AssetRecord {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long assetId;

    private String operationType;

    private LocalDateTime operationDate;

    private Long operatorId;

    private Long targetUserId;

    private Long deptId;

    private Integer quantity;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
