package com.crm.service;

import com.crm.entity.Customer;
import com.crm.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {
    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }

    public Customer save(Customer customer) {
        return customerRepository.save(customer);
    }

    public void deleteById(Long id) {
        customerRepository.deleteById(id);
    }

    public List<Customer> findByStatus(String status) {
        return customerRepository.findByStatus(status);
    }

    public List<Customer> getUpcomingFollowUps() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekLater = now.plusDays(7);
        return customerRepository.findCustomersWithUpcomingFollowUps(now, weekLater);
    }

    public long getTotalCount() {
        return customerRepository.count();
    }

    public List<Object[]> getCustomerSourceStats() {
        return customerRepository.countBySource();
    }
}
