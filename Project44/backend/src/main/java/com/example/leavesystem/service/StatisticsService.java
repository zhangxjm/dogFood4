package com.example.leavesystem.service;

import com.example.leavesystem.repository.LeaveApplicationRepository;
import com.example.leavesystem.repository.LeaveTypeConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {
    @Autowired
    private LeaveApplicationRepository leaveRepository;

    @Autowired
    private LeaveTypeConfigRepository leaveTypeConfigRepository;

    public Map<String, Object> getClassStatistics(String className, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        
        long approvedCount = leaveRepository.countApprovedByClassAndDateRange(className, startDate, endDate);
        
        result.put("className", className);
        result.put("startDate", startDate);
        result.put("endDate", endDate);
        result.put("approvedCount", approvedCount);
        
        return result;
    }

    public List<Object[]> getAllClassStatistics(LocalDate startDate, LocalDate endDate) {
        return leaveRepository.countApprovedGroupByClass(startDate, endDate);
    }

    public List<Object[]> getStatisticsByLeaveType(LocalDate startDate, LocalDate endDate) {
        return leaveRepository.countGroupByLeaveType(startDate, endDate);
    }
}
