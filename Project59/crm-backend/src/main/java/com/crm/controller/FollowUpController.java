package com.crm.controller;

import com.crm.entity.FollowUp;
import com.crm.service.FollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/followups")
public class FollowUpController {
    @Autowired
    private FollowUpService followUpService;

    @GetMapping
    public List<FollowUp> getAllFollowUps() {
        return followUpService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FollowUp> getFollowUpById(@PathVariable Long id) {
        return followUpService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public List<FollowUp> getFollowUpsByCustomerId(@PathVariable Long customerId) {
        return followUpService.findByCustomerId(customerId);
    }

    @PostMapping
    public FollowUp createFollowUp(@RequestBody FollowUp followUp) {
        return followUpService.save(followUp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUp> updateFollowUp(@PathVariable Long id, @RequestBody FollowUp followUp) {
        return followUpService.findById(id)
                .map(existing -> {
                    followUp.setId(id);
                    return ResponseEntity.ok(followUpService.save(followUp));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFollowUp(@PathVariable Long id) {
        if (followUpService.findById(id).isPresent()) {
            followUpService.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
