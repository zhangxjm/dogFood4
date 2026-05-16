package com.crm.repository;

import com.crm.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByCustomerId(Long customerId);
    
    List<Contract> findByStatus(String status);
    
    @Query("SELECT SUM(c.amount) FROM Contract c")
    java.math.BigDecimal getTotalContractAmount();
    
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.status = :status")
    long countByStatus(String status);
}
