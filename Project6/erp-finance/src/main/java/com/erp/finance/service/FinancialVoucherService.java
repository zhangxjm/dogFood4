package com.erp.finance.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.FinancialVoucher;
import com.erp.common.exception.BusinessException;
import com.erp.common.util.OrderNoUtil;
import com.erp.finance.mapper.FinancialVoucherMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinancialVoucherService extends ServiceImpl<FinancialVoucherMapper, FinancialVoucher> {

    @Transactional(rollbackFor = Exception.class)
    public FinancialVoucher saveVoucher(FinancialVoucher voucher) {
        voucher.setVoucherNo(OrderNoUtil.generateVoucherNo());
        if (voucher.getVoucherDate() == null) {
            voucher.setVoucherDate(LocalDateTime.now());
        }
        save(voucher);
        log.info("财务凭证创建成功: {}", voucher.getVoucherNo());
        return voucher;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinancialVoucher updateVoucher(FinancialVoucher voucher) {
        FinancialVoucher exist = getById(voucher.getId());
        if (exist == null) {
            throw new BusinessException("财务凭证不存在");
        }
        updateById(voucher);
        return voucher;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteVoucher(Long id) {
        FinancialVoucher exist = getById(id);
        if (exist == null) {
            throw new BusinessException("财务凭证不存在");
        }
        removeById(id);
    }

    public FinancialVoucher getVoucherById(Long id) {
        FinancialVoucher voucher = getById(id);
        if (voucher == null) {
            throw new BusinessException("财务凭证不存在");
        }
        return voucher;
    }

    public IPage<FinancialVoucher> pageQuery(PageQuery query) {
        Page<FinancialVoucher> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<FinancialVoucher> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(FinancialVoucher::getVoucherNo, query.getKeyword())
                    .or().like(FinancialVoucher::getBusinessOrderNo, query.getKeyword());
        }
        wrapper.orderByDesc(FinancialVoucher::getCreateTime);
        return page(page, wrapper);
    }

    public List<FinancialVoucher> getByBusinessOrder(String businessOrderNo) {
        LambdaQueryWrapper<FinancialVoucher> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FinancialVoucher::getBusinessOrderNo, businessOrderNo);
        return list(wrapper);
    }
}