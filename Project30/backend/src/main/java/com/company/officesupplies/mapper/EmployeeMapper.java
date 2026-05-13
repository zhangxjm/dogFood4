package com.company.officesupplies.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.company.officesupplies.entity.Employee;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmployeeMapper extends BaseMapper<Employee> {
}
