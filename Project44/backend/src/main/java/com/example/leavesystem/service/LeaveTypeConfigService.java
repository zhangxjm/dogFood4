package com.example.leavesystem.service;

import com.example.leavesystem.entity.LeaveTypeConfig;
import com.example.leavesystem.repository.LeaveTypeConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LeaveTypeConfigService {

    @Autowired
    private LeaveTypeConfigRepository leaveTypeConfigRepository;

    public List<LeaveTypeConfig> getAllLeaveTypes() {
        return leaveTypeConfigRepository.findAll();
    }

    public List<LeaveTypeConfig> getEnabledLeaveTypes() {
        return leaveTypeConfigRepository.findByEnabledTrue();
    }

    public Optional<LeaveTypeConfig> getLeaveTypeById(Long id) {
        return leaveTypeConfigRepository.findById(id);
    }

    public Optional<LeaveTypeConfig> getLeaveTypeByCode(String typeCode) {
        return leaveTypeConfigRepository.findByTypeCode(typeCode);
    }

    @Transactional
    public LeaveTypeConfig createLeaveType(LeaveTypeConfig config) {
        if (leaveTypeConfigRepository.existsByTypeCode(config.getTypeCode())) {
            throw new RuntimeException("类型编码已存在");
        }
        if (leaveTypeConfigRepository.existsByTypeName(config.getTypeName())) {
            throw new RuntimeException("类型名称已存在");
        }
        return leaveTypeConfigRepository.save(config);
    }

    @Transactional
    public LeaveTypeConfig updateLeaveType(Long id, LeaveTypeConfig config) {
        LeaveTypeConfig existing = leaveTypeConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("请假类型不存在"));

        if (!existing.getTypeCode().equals(config.getTypeCode()) &&
                leaveTypeConfigRepository.existsByTypeCode(config.getTypeCode())) {
            throw new RuntimeException("类型编码已存在");
        }
        if (!existing.getTypeName().equals(config.getTypeName()) &&
                leaveTypeConfigRepository.existsByTypeName(config.getTypeName())) {
            throw new RuntimeException("类型名称已存在");
        }

        existing.setTypeCode(config.getTypeCode());
        existing.setTypeName(config.getTypeName());
        existing.setDescription(config.getDescription());
        return leaveTypeConfigRepository.save(existing);
    }

    @Transactional
    public LeaveTypeConfig toggleEnabled(Long id) {
        LeaveTypeConfig config = leaveTypeConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("请假类型不存在"));
        config.setEnabled(!config.getEnabled());
        return leaveTypeConfigRepository.save(config);
    }

    @Transactional
    public void deleteLeaveType(Long id) {
        if (!leaveTypeConfigRepository.existsById(id)) {
            throw new RuntimeException("请假类型不存在");
        }
        leaveTypeConfigRepository.deleteById(id);
    }
}