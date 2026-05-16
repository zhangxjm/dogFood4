package com.example.leavesystem.service;

import com.example.leavesystem.dto.LeaveApplicationDTO;
import com.example.leavesystem.entity.LeaveApplication;
import com.example.leavesystem.entity.User;
import com.example.leavesystem.enums.LeaveStatus;
import com.example.leavesystem.enums.UserRole;
import com.example.leavesystem.repository.LeaveApplicationRepository;
import com.example.leavesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class LeaveApplicationService {
    @Autowired
    private LeaveApplicationRepository leaveRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public LeaveApplication createLeave(Long studentId, LeaveApplicationDTO dto) {
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("开始日期不能晚于结束日期");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("学生不存在"));

        if (student.getRole() != UserRole.STUDENT) {
            throw new RuntimeException("只有学生可以申请请假");
        }

        LeaveApplication leave = new LeaveApplication();
        leave.setStudent(student);
        leave.setLeaveType(dto.getLeaveType());
        leave.setStartDate(dto.getStartDate());
        leave.setEndDate(dto.getEndDate());
        leave.setReason(dto.getReason());
        leave.setStatus(LeaveStatus.PENDING_FIRST);

        return leaveRepository.save(leave);
    }

    public List<LeaveApplication> getMyLeaves(Long studentId) {
        return leaveRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public LeaveApplication getById(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("请假申请不存在"));
    }

    @Transactional
    public LeaveApplication approveFirstLevel(Long teacherId, Long leaveId, Boolean approved, String comment) {
        LeaveApplication leave = getById(leaveId);
        
        if (leave.getStatus() != LeaveStatus.PENDING_FIRST) {
            throw new RuntimeException("当前状态不允许一级审批");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("老师不存在"));

        if (teacher.getRole() != UserRole.TEACHER_FIRST) {
            throw new RuntimeException("权限不足：需要一级审批老师权限");
        }

        leave.setFirstApprover(teacher);
        leave.setFirstApproveComment(comment);
        leave.setFirstApproveTime(LocalDateTime.now());

        if (!approved) {
            leave.setStatus(LeaveStatus.REJECTED);
        } else {
            leave.setStatus(LeaveStatus.PENDING_SECOND);
        }

        return leaveRepository.save(leave);
    }

    @Transactional
    public LeaveApplication approveSecondLevel(Long teacherId, Long leaveId, Boolean approved, String comment) {
        LeaveApplication leave = getById(leaveId);
        
        if (leave.getStatus() != LeaveStatus.PENDING_SECOND) {
            throw new RuntimeException("当前状态不允许二级审批");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("老师不存在"));

        if (teacher.getRole() != UserRole.TEACHER_SECOND) {
            throw new RuntimeException("权限不足：需要二级审批老师权限");
        }

        leave.setSecondApprover(teacher);
        leave.setSecondApproveComment(comment);
        leave.setSecondApproveTime(LocalDateTime.now());

        if (!approved) {
            leave.setStatus(LeaveStatus.REJECTED);
        } else {
            leave.setStatus(LeaveStatus.APPROVED);
        }

        return leaveRepository.save(leave);
    }

    public List<LeaveApplication> getPendingFirst() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING_FIRST);
    }

    public List<LeaveApplication> getPendingSecond() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.PENDING_SECOND);
    }

    public List<LeaveApplication> getApproved() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.APPROVED);
    }

    public List<LeaveApplication> getRejected() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc(LeaveStatus.REJECTED);
    }

    public List<LeaveApplication> getByClass(String className) {
        return leaveRepository.findByStudentClassNameOrderByCreatedAtDesc(className);
    }

    public List<LeaveApplication> getAllLeaves() {
        return leaveRepository.findAll();
    }
}
