package com.example.leavesystem.controller;

import com.example.leavesystem.entity.LeaveTypeConfig;
import com.example.leavesystem.service.LeaveTypeConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-types")
@CrossOrigin(origins = "*")
public class LeaveTypeConfigController {

    @Autowired
    private LeaveTypeConfigService leaveTypeConfigService;

    @GetMapping
    public ResponseEntity<List<LeaveTypeConfig>> getAllLeaveTypes() {
        return ResponseEntity.ok(leaveTypeConfigService.getAllLeaveTypes());
    }

    @GetMapping("/enabled")
    public ResponseEntity<List<LeaveTypeConfig>> getEnabledLeaveTypes() {
        return ResponseEntity.ok(leaveTypeConfigService.getEnabledLeaveTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveTypeConfig> getLeaveTypeById(@PathVariable Long id) {
        return leaveTypeConfigService.getLeaveTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createLeaveType(@RequestBody LeaveTypeConfig config) {
        try {
            return ResponseEntity.ok(leaveTypeConfigService.createLeaveType(config));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLeaveType(@PathVariable Long id, @RequestBody LeaveTypeConfig config) {
        try {
            return ResponseEntity.ok(leaveTypeConfigService.updateLeaveType(id, config));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleEnabled(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(leaveTypeConfigService.toggleEnabled(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeaveType(@PathVariable Long id) {
        try {
            leaveTypeConfigService.deleteLeaveType(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}