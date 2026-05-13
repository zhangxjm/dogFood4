package com.erp.sales.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.erp.common.dto.PageQuery;
import com.erp.common.entity.Customer;
import com.erp.common.exception.BusinessException;
import com.erp.sales.mapper.CustomerMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService extends ServiceImpl<CustomerMapper, Customer> {

    @Transactional(rollbackFor = Exception.class)
    public Customer saveCustomer(Customer customer) {
        if (!StringUtils.hasText(customer.getCustomerCode())) {
            customer.setCustomerCode("C" + System.currentTimeMillis());
        }
        if (customer.getStatus() == null) {
            customer.setStatus(1);
        }
        save(customer);
        log.info("客户创建成功: {}", customer.getCustomerName());
        return customer;
    }

    @Transactional(rollbackFor = Exception.class)
    public Customer updateCustomer(Customer customer) {
        Customer exist = getById(customer.getId());
        if (exist == null) {
            throw new BusinessException("客户不存在");
        }
        updateById(customer);
        return customer;
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteCustomer(Long id) {
        Customer exist = getById(id);
        if (exist == null) {
            throw new BusinessException("客户不存在");
        }
        removeById(id);
    }

    public Customer getCustomerById(Long id) {
        Customer customer = getById(id);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }
        return customer;
    }

    public IPage<Customer> pageQuery(PageQuery query) {
        Page<Customer> page = new Page<>(query.getPageNum(), query.getPageSize());
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Customer::getCustomerName, query.getKeyword())
                    .or().like(Customer::getCustomerCode, query.getKeyword());
        }
        wrapper.orderByDesc(Customer::getCreateTime);
        return page(page, wrapper);
    }

    public List<Customer> listAll() {
        return list();
    }
}