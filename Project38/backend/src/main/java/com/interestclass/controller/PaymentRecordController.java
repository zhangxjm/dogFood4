package com.interestclass.controller;

import com.interestclass.entity.PaymentRecord;
import com.interestclass.service.PaymentRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentRecordController {
    
    @Autowired
    private PaymentRecordService paymentRecordService;
    
    @GetMapping
    public List<PaymentRecord> getAllPaymentRecords() {
        return paymentRecordService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaymentRecord> getPaymentRecordById(@PathVariable Long id) {
        return paymentRecordService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/student/{studentId}")
    public List<PaymentRecord> getPaymentRecordsByStudentId(@PathVariable Long studentId) {
        return paymentRecordService.findByStudentId(studentId);
    }
    
    @PostMapping
    public PaymentRecord createPaymentRecord(@RequestBody PaymentRecord paymentRecord) {
        return paymentRecordService.save(paymentRecord);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PaymentRecord> updatePaymentRecord(@PathVariable Long id, @RequestBody PaymentRecord paymentRecordDetails) {
        return paymentRecordService.findById(id)
                .map(paymentRecord -> {
                    paymentRecord.setAmount(paymentRecordDetails.getAmount());
                    paymentRecord.setPaymentDate(paymentRecordDetails.getPaymentDate());
                    paymentRecord.setPaymentMethod(paymentRecordDetails.getPaymentMethod());
                    paymentRecord.setDescription(paymentRecordDetails.getDescription());
                    PaymentRecord updated = paymentRecordService.save(paymentRecord);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentRecord(@PathVariable Long id) {
        return paymentRecordService.findById(id)
                .map(paymentRecord -> {
                    paymentRecordService.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
