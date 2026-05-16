package com.crm.controller;

import com.crm.entity.SalesOpportunity;
import com.crm.service.SalesOpportunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
public class SalesOpportunityController {
    @Autowired
    private SalesOpportunityService salesOpportunityService;

    @GetMapping
    public List<SalesOpportunity> getAllOpportunities() {
        return salesOpportunityService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOpportunity> getOpportunityById(@PathVariable Long id) {
        return salesOpportunityService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public List<SalesOpportunity> getOpportunitiesByCustomerId(@PathVariable Long customerId) {
        return salesOpportunityService.findByCustomerId(customerId);
    }

    @PostMapping
    public SalesOpportunity createOpportunity(@RequestBody SalesOpportunity opportunity) {
        return salesOpportunityService.save(opportunity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesOpportunity> updateOpportunity(@PathVariable Long id, @RequestBody SalesOpportunity opportunity) {
        return salesOpportunityService.findById(id)
                .map(existing -> {
                    opportunity.setId(id);
                    return ResponseEntity.ok(salesOpportunityService.save(opportunity));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpportunity(@PathVariable Long id) {
        if (salesOpportunityService.findById(id).isPresent()) {
            salesOpportunityService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/funnel")
    public List<Object[]> getSalesFunnelData() {
        return salesOpportunityService.getSalesFunnelData();
    }
}
