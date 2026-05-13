package com.interestclass.service;

import com.interestclass.entity.PaymentRecord;
import com.interestclass.entity.Student;
import com.interestclass.repository.PaymentRecordRepository;
import com.interestclass.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PaymentRecordService {
    
    @Autowired
    private PaymentRecordRepository paymentRecordRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    public List<PaymentRecord> findAll() {
        return paymentRecordRepository.findAll();
    }
    
    public Optional<PaymentRecord> findById(Long id) {
        return paymentRecordRepository.findById(id);
    }
    
    public List<PaymentRecord> findByStudentId(Long studentId) {
        return paymentRecordRepository.findByStudentId(studentId);
    }
    
    public PaymentRecord save(PaymentRecord paymentRecord) {
        if (paymentRecord.getStudent() != null && paymentRecord.getStudent().getId() != null) {
            Optional<Student> student = studentRepository.findById(paymentRecord.getStudent().getId());
            student.ifPresent(paymentRecord::setStudent);
        }
        
        return paymentRecordRepository.save(paymentRecord);
    }
    
    public void deleteById(Long id) {
        paymentRecordRepository.deleteById(id);
    }
}
