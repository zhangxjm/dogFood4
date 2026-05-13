package com.erp.sales.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.SalesOrder;
import com.erp.common.entity.SalesOrderDetail;
import com.erp.common.exception.BusinessException;
import com.erp.common.util.OrderNoUtil;
import com.erp.sales.mapper.SalesOrderDetailMapper;
import com.erp.sales.mapper.SalesOrderMapper;
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
public class SalesOrderService extends ServiceImpl<SalesOrderMapper, SalesOrder> {

    private final SalesOrderDetailMapper detailMapper;

    @Transactional(rollbackFor = Exception.class)
    public SalesOrder createOrder(SalesOrder order, List<SalesOrderDetail> details) {
        order.setOrderNo(OrderNoUtil.generateSalesOrderNo());
        order.setOrderDate(LocalDateTime.now());
        if (order.getStatus() == null) {
            order.setStatus(0);
        }
        if (order.getTotalAmount() == null) {
            order.setTotalAmount(BigDecimal.ZERO);
        }
        if (order.getReceivedAmount() == null) {
            order.setReceivedAmount(BigDecimal.ZERO);
        }
        order.setUncollectedAmount(order.getTotalAmount().subtract(order.getReceivedAmount()));
        save(order);

        if (details != null && !details.isEmpty()) {
            for (SalesOrderDetail detail : details) {
                detail.setOrderId(order.getId());
                detail.setOrderNo(order.getOrderNo());
                detailMapper.insert(detail);
            }
        }
        log.info("销售订单创建成功: {}", order.getOrderNo());
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public SalesOrder updateOrder(SalesOrder order) {
        SalesOrder exist = getById(order.getId());
        if (exist == null) {
            throw new BusinessException("销售订单不存在");
        }
        updateById(order);
        return order;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteOrder(Long id) {
        SalesOrder exist = getById(id);
        if (exist == null) {
            throw new BusinessException("销售订单不存在");
        }
        removeById(id);
        LambdaQueryWrapper<SalesOrderDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalesOrderDetail::getOrderId, id);
        detailMapper.delete(wrapper);
    }

    public SalesOrder getOrderById(Long id) {
        SalesOrder order = getById(id);
        if (order == null) {
            throw new BusinessException("销售订单不存在");
        }
        return order;
    }

    public List<SalesOrderDetail> getOrderDetails(Long orderId) {
        LambdaQueryWrapper<SalesOrderDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SalesOrderDetail::getOrderId, orderId);
        return detailMapper.selectList(wrapper);
    }

    public IPage<SalesOrder> pageQuery(PageQuery query) {
        Page<SalesOrder> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<SalesOrder> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(SalesOrder::getOrderNo, query.getKeyword());
        }
        wrapper.orderByDesc(SalesOrder::getCreateTime);
        return page(page, wrapper);
    }
}