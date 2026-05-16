package com.crm.service;

import com.crm.entity.Customer;
import com.crm.entity.FollowUp;
import com.crm.repository.CustomerRepository;
import com.crm.repository.FollowUpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FollowUpService {
    @Autowired
    private FollowUpRepository followUpRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    public List<FollowUp> findAll() {
        List<FollowUp> followUps = followUpRepository.findAll();
        followUps.forEach(this::populateCustomerName);
        return followUps;
    }

    public Optional<FollowUp> findById(Long id) {
        Optional<FollowUp> followUp = followUpRepository.findById(id);
        followUp.ifPresent(this::populateCustomerName);
        return followUp;
    }

    public List<FollowUp> findByCustomerId(Long customerId) {
        List<FollowUp> followUps = followUpRepository.findByCustomerIdOrderByFollowUpTimeDesc(customerId);
        followUps.forEach(this::populateCustomerName);
        return followUps;
    }

    public FollowUp save(FollowUp followUp) {
        return followUpRepository.save(followUp);
    }

    public void deleteById(Long id) {
        followUpRepository.deleteById(id);
    }

    private void populateCustomerName(FollowUp followUp) {
        if (followUp.getCustomerId() != null) {
            Optional<Customer> customer = customerRepository.findById(followUp.getCustomerId());
            customer.ifPresent(c -> followUp.setCustomerName(c.getName()));
        }
    }
}
