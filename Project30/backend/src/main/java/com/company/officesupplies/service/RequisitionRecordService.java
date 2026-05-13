package com.company.officesupplies.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.company.officesupplies.dto.RequisitionDTO;
import com.company.officesupplies.entity.Employee;
import com.company.officesupplies.entity.Item;
import com.company.officesupplies.entity.RequisitionRecord;
import com.company.officesupplies.mapper.RequisitionRecordMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RequisitionRecordService extends ServiceImpl<RequisitionRecordMapper, RequisitionRecord> {

    @Autowired
    private ItemService itemService;

    @Autowired
    private EmployeeService employeeService;

    @Transactional
    public RequisitionRecord createRequisition(RequisitionDTO dto) {
        Item item = itemService.getById(dto.getItemId());
        if (item == null) {
            throw new RuntimeException("物品不存在");
        }
        Employee employee = employeeService.getById(dto.getEmployeeId());
        if (employee == null) {
            throw new RuntimeException("员工不存在");
        }
        if (item.getQuantity() < dto.getQuantity()) {
            throw new RuntimeException("库存不足，当前库存：" + item.getQuantity());
        }

        RequisitionRecord record = new RequisitionRecord();
        record.setItemId(dto.getItemId());
        record.setEmployeeId(dto.getEmployeeId());
        record.setQuantity(dto.getQuantity());
        record.setPurpose(dto.getPurpose());
        record.setRequisitionTime(LocalDateTime.now());
        this.save(record);

        itemService.decreaseStock(dto.getItemId(), dto.getQuantity());

        return record;
    }

    public Page<RequisitionRecord> listByPage(int page, int size, Long itemId, Long employeeId,
                                               String startDate, String endDate) {
        Page<RequisitionRecord> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<RequisitionRecord> wrapper = new LambdaQueryWrapper<>();
        
        if (itemId != null) {
            wrapper.eq(RequisitionRecord::getItemId, itemId);
        }
        if (employeeId != null) {
            wrapper.eq(RequisitionRecord::getEmployeeId, employeeId);
        }
        if (startDate != null && !startDate.isEmpty()) {
            wrapper.ge(RequisitionRecord::getRequisitionTime, startDate + " 00:00:00");
        }
        if (endDate != null && !endDate.isEmpty()) {
            wrapper.le(RequisitionRecord::getRequisitionTime, endDate + " 23:59:59");
        }
        wrapper.orderByDesc(RequisitionRecord::getRequisitionTime);
        
        Page<RequisitionRecord> result = this.page(pageParam, wrapper);
        fillAdditionalInfo(result.getRecords());
        return result;
    }

    private void fillAdditionalInfo(List<RequisitionRecord> records) {
        if (records == null || records.isEmpty()) {
            return;
        }
        
        List<Long> itemIds = records.stream().map(RequisitionRecord::getItemId).distinct().collect(Collectors.toList());
        List<Long> employeeIds = records.stream().map(RequisitionRecord::getEmployeeId).distinct().collect(Collectors.toList());
        
        List<Item> items = itemService.listByIds(itemIds);
        List<Employee> employees = employeeService.listByIds(employeeIds);
        
        Map<Long, Item> itemMap = items.stream().collect(Collectors.toMap(Item::getId, i -> i));
        Map<Long, Employee> employeeMap = employees.stream().collect(Collectors.toMap(Employee::getId, e -> e));
        
        records.forEach(record -> {
            Item item = itemMap.get(record.getItemId());
            if (item != null) {
                record.setItemName(item.getName());
                record.setItemUnit(item.getUnit());
            }
            Employee emp = employeeMap.get(record.getEmployeeId());
            if (emp != null) {
                record.setEmployeeName(emp.getName());
                record.setEmployeeNo(emp.getEmployeeNo());
                record.setDepartment(emp.getDepartment());
            }
        });
    }
}
