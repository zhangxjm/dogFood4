package com.example.leavesystem.controller;

import com.example.leavesystem.dto.ApproveDTO;
import com.example.leavesystem.dto.LeaveApplicationDTO;
import com.example.leavesystem.entity.LeaveApplication;
import com.example.leavesystem.service.ExcelExportService;
import com.example.leavesystem.service.LeaveApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "*")
public class LeaveApplicationController {
    @Autowired
    private LeaveApplicationService leaveService;

    @Autowired
    private ExcelExportService excelService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createLeave(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody LeaveApplicationDTO dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            LeaveApplication leave = leaveService.createLeave(userId, dto);
            result.put("success", true);
            result.put("data", leave);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyLeaves(@RequestHeader("X-User-Id") Long userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getMyLeaves(userId));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getById(id));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pending-first")
    public ResponseEntity<Map<String, Object>> getPendingFirst() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getPendingFirst());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pending-second")
    public ResponseEntity<Map<String, Object>> getPendingSecond() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getPendingSecond());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/approved")
    public ResponseEntity<Map<String, Object>> getApproved() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getApproved());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/rejected")
    public ResponseEntity<Map<String, Object>> getRejected() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getRejected());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/approve-first")
    public ResponseEntity<Map<String, Object>> approveFirst(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody ApproveDTO dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            LeaveApplication leave = leaveService.approveFirstLevel(userId, id, dto.getApproved(), dto.getComment());
            result.put("success", true);
            result.put("data", leave);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }

    @PostMapping("/{id}/approve-second")
    public ResponseEntity<Map<String, Object>> approveSecond(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id,
            @RequestBody ApproveDTO dto) {
        Map<String, Object> result = new HashMap<>();
        try {
            LeaveApplication leave = leaveService.approveSecondLevel(userId, id, dto.getApproved(), dto.getComment());
            result.put("success", true);
            result.put("data", leave);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/class/{className}")
    public ResponseEntity<Map<String, Object>> getByClass(@PathVariable String className) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getByClass(className));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAll() {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", leaveService.getAllLeaves());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportToExcel() throws IOException {
        List<LeaveApplication> leaves = leaveService.getAllLeaves();
        byte[] excelBytes = excelService.exportLeaveApplications(leaves);

        String fileName = "请假记录_" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";
        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFileName + "\"; filename*=UTF-8''" + encodedFileName)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
