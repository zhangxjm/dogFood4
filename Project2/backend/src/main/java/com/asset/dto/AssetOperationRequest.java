package com.asset.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;

@Data
public class AssetOperationRequest {
    @NotNull(message = "资产ID不能为空")
    private Long assetId;

    private Long targetUserId;

    private Long deptId;

    private String remark;
}
