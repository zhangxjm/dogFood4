package com.asset.service;

import com.asset.common.BusinessException;
import com.asset.entity.Department;
import com.asset.mapper.DepartmentMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentMapper departmentMapper;

    public List<Department> list() {
        return departmentMapper.selectList(new LambdaQueryWrapper<Department>()
                .orderByAsc(Department::getSortOrder));
    }

    public Department getById(Long id) {
        Department dept = departmentMapper.selectById(id);
        if (dept == null) {
            throw new BusinessException("部门不存在");
        }
        return dept;
    }

    @Transactional
    public Department create(Department department) {
        Department exist = departmentMapper.selectOne(new LambdaQueryWrapper<Department>()
                .eq(Department::getDeptCode, department.getDeptCode()));
        if (exist != null) {
            throw new BusinessException("部门编码已存在");
        }
        department.setStatus(department.getStatus() != null ? department.getStatus() : 1);
        departmentMapper.insert(department);
        return department;
    }

    @Transactional
    public Department update(Department department) {
        getById(department.getId());
        if (department.getDeptCode() != null) {
            Department check = departmentMapper.selectOne(new LambdaQueryWrapper<Department>()
                    .eq(Department::getDeptCode, department.getDeptCode())
                    .ne(Department::getId, department.getId()));
            if (check != null) {
                throw new BusinessException("部门编码已存在");
            }
        }
        departmentMapper.updateById(department);
        return department;
    }

    @Transactional
    public void delete(Long id) {
        List<Department> children = departmentMapper.selectList(new LambdaQueryWrapper<Department>()
                .eq(Department::getParentId, id));
        if (!children.isEmpty()) {
            throw new BusinessException("存在子部门，不能删除");
        }
        getById(id);
        departmentMapper.deleteById(id);
    }
}
