package com.crm.repository;

import com.crm.entity.SalesOpportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesOpportunityRepository extends JpaRepository<SalesOpportunity, Long> {
    List<SalesOpportunity> findByCustomerId(Long customerId);
    
    List<SalesOpportunity> findByStage(String stage);
    
    @Query("SELECT o.stage, COUNT(o), SUM(o.amount) FROM SalesOpportunity o GROUP BY o.stage")
    List<Object[]> getSalesFunnelData();
    
    @Query("SELECT SUM(o.amount) FROM SalesOpportunity o WHERE o.status = 'WON'")
    java.math.BigDecimal getTotalWonAmount();
}
