package com.erp.purchase.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.PurchaseOrder;
import com.erp.common.entity.PurchaseOrderDetail;
import com.erp.common.exception.BusinessException;
import com.erp.common.util.OrderNoUtil;
import com.erp.purchase.mapper.PurchaseOrderDetailMapper;
import com.erp.purchase.mapper.PurchaseOrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseOrderService extends ServiceImpl<PurchaseOrderMapper, PurchaseOrder> {

    private final PurchaseOrderDetailMapper detailMapper;

    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrder createOrder(PurchaseOrder order, List<PurchaseOrderDetail> details) {
        order.setOrderNo(OrderNoUtil.generatePurchaseOrderNo());
        order.setOrderDate(LocalDateTime.now());
        if (order.getStatus() == null) {
            order.setStatus(0);
        }
        if (order.getTotalAmount() == null) {
            order.setTotalAmount(BigDecimal.ZERO);
        }
        if (order.getPaidAmount() == null) {
            order.setPaidAmount(BigDecimal.ZERO);
        }
        order.setUnpaidAmount(order.getTotalAmount().subtract(order.getPaidAmount()));
        save(order);

        if (details != null && !details.isEmpty()) {
            for (PurchaseOrderDetail detail : details) {
                detail.setOrderId(order.getId());
                detail.setOrderNo(order.getOrderNo());
                detailMapper.insert(detail);
            }
        }
        log.info("采购订单创建成功: {}", order.getOrderNo());
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public PurchaseOrder updateOrder(PurchaseOrder order) {
        PurchaseOrder exist = getById(order.getId());
        if (exist == null) {
            throw new BusinessException("采购订单不存在");
        }
        updateById(order);
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        PurchaseOrder exist = getById(id);
        if (exist == null) {
            throw new BusinessException("采购订单不存在");
        }
        removeById(id);
        LambdaQueryWrapper<PurchaseOrderDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PurchaseOrderDetail::getOrderId, id);
        detailMapper.delete(wrapper);
    }

    public PurchaseOrder getOrderById(Long id) {
        PurchaseOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("采购订单不存在");
        }
        return order;
    }

    public List<PurchaseOrderDetail> getOrderDetails(Long orderId) {
        LambdaQueryWrapper<PurchaseOrderDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PurchaseOrderDetail::getOrderId, orderId);
        return detailMapper.selectList(wrapper);
    }

    public IPage<PurchaseOrder> pageQuery(PageQuery query) {
        Page<PurchaseOrder> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<PurchaseOrder> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(PurchaseOrder::getOrderNo, query.getKeyword());
        }
        wrapper.orderByDesc(PurchaseOrder::getCreateTime);
        return page(page, wrapper);
    }
}