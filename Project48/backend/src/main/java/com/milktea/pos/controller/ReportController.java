package com.milktea.pos.controller;

import com.milktea.pos.dto.DailyReportDTO;
import com.milktea.pos.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/daily")
    public ResponseEntity<DailyReportDTO> getDailyReport(@RequestParam(required = false) String date) {
        LocalDate reportDate = date != null ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(orderService.getDailyReport(reportDate));
    }
}
