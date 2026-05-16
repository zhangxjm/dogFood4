package com.crm.service;

import com.crm.entity.Contract;
import com.crm.entity.Customer;
import com.crm.repository.ContractRepository;
import com.crm.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ContractService {
    @Autowired
    private ContractRepository contractRepository;
    
    @Autowired
    private CustomerRepository customerRepository;

    public List<Contract> findAll() {
        List<Contract> contracts = contractRepository.findAll();
        contracts.forEach(this::populateCustomerName);
        return contracts;
    }

    public Optional<Contract> findById(Long id) {
        Optional<Contract> contract = contractRepository.findById(id);
        contract.ifPresent(this::populateCustomerName);
        return contract;
    }

    public List<Contract> findByCustomerId(Long customerId) {
        List<Contract> contracts = contractRepository.findByCustomerId(customerId);
        contracts.forEach(this::populateCustomerName);
        return contracts;
    }

    public Contract save(Contract contract) {
        if (contract.getContractNo() == null || contract.getContractNo().isEmpty()) {
            contract.setContractNo(generateContractNo());
        }
        return contractRepository.save(contract);
    }

    public void deleteById(Long id) {
        contractRepository.deleteById(id);
    }

    public java.math.BigDecimal getTotalContractAmount() {
        return contractRepository.getTotalContractAmount();
    }

    private String generateContractNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = contractRepository.count() + 1;
        return "HT" + dateStr + String.format("%04d", count);
    }

    private void populateCustomerName(Contract contract) {
        if (contract.getCustomerId() != null) {
            Optional<Customer> customer = customerRepository.findById(contract.getCustomerId());
            customer.ifPresent(c -> contract.setCustomerName(c.getName()));
        }
    }
}
