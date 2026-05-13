package com.erp.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("financial_voucher")
public class FinancialVoucher implements Serializable {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String voucherNo;
    private Integer voucherType;
    private String businessOrderNo;
    private Long businessOrderId;
    private Long partyId;
    private String partyName;
    private Integer partyType;
    private BigDecimal amount;
    private String paymentMethod;
    private LocalDateTime voucherDate;
    private String operator;
    private String remark;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}