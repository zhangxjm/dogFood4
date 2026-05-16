package com.crm.service;

import com.crm.entity.Customer;
import com.crm.entity.SalesOpportunity;
import com.crm.repository.CustomerRepository;
import com.crm.repository.SalesOpportunityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalesOpportunityService {
    @Autowired
    private SalesOpportunityRepository salesOpportunityRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    public List<SalesOpportunity> findAll() {
        List<SalesOpportunity> opportunities = salesOpportunityRepository.findAll();
        opportunities.forEach(this::populateCustomerName);
        return opportunities;
    }

    public Optional<SalesOpportunity> findById(Long id) {
        Optional<SalesOpportunity> opportunity = salesOpportunityRepository.findById(id);
        opportunity.ifPresent(this::populateCustomerName);
        return opportunity;
    }

    public List<SalesOpportunity> findByCustomerId(Long customerId) {
        List<SalesOpportunity> opportunities = salesOpportunityRepository.findByCustomerId(customerId);
        opportunities.forEach(this::populateCustomerName);
        return opportunities;
    }

    public SalesOpportunity save(SalesOpportunity opportunity) {
        return salesOpportunityRepository.save(opportunity);
    }

    public void deleteById(Long id) {
        salesOpportunityRepository.deleteById(id);
    }

    public List<Object[]> getSalesFunnelData() {
        return salesOpportunityRepository.getSalesFunnelData();
    }

    private void populateCustomerName(SalesOpportunity opportunity) {
        if (opportunity.getCustomerId() != null) {
            Optional<Customer> customer = customerRepository.findById(opportunity.getCustomerId());
            customer.ifPresent(c -> opportunity.setCustomerName(c.getName()));
        }
    }
}
