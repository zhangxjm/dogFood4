package com.example.leavesystem.controller;

import com.example.leavesystem.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {
    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/class")
    public ResponseEntity<Map<String, Object>> getClassStatistics(
            @RequestParam String className,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", statisticsService.getClassStatistics(className, startDate, endDate));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all-classes")
    public ResponseEntity<Map<String, Object>> getAllClassStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Object[]> rawData = statisticsService.getAllClassStatistics(startDate, endDate);
        
        List<Map<String, Object>> formattedData = new ArrayList<>();
        for (Object[] row : rawData) {
            Map<String, Object> item = new HashMap<>();
            item.put("className", row[0]);
            item.put("count", row[1]);
            formattedData.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", formattedData);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/by-leave-type")
    public ResponseEntity<Map<String, Object>> getStatisticsByLeaveType(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Object[]> rawData = statisticsService.getStatisticsByLeaveType(startDate, endDate);
        
        List<Map<String, Object>> formattedData = new ArrayList<>();
        for (Object[] row : rawData) {
            Map<String, Object> item = new HashMap<>();
            item.put("leaveType", row[0]);
            item.put("count", row[1]);
            formattedData.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", formattedData);
        return ResponseEntity.ok(result);
    }
}
