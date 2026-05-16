package com.crm.repository;

import com.crm.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByStatus(String status);
    
    List<Customer> findByLevel(String level);
    
    @Query("SELECT c FROM Customer c WHERE c.nextFollowUp BETWEEN :start AND :end")
    List<Customer> findCustomersWithUpcomingFollowUps(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT COUNT(c) FROM Customer c WHERE c.status = :status")
    long countByStatus(String status);
    
    @Query("SELECT c.source, COUNT(c) FROM Customer c GROUP BY c.source")
    List<Object[]> countBySource();
}
