package com.crm.controller;

import com.crm.service.ContractService;
import com.crm.service.CustomerService;
import com.crm.service.SalesOpportunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {
    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private SalesOpportunityService salesOpportunityService;
    
    @Autowired
    private ContractService contractService;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalCustomers", customerService.getTotalCount());
        stats.put("totalContractsAmount", contractService.getTotalContractAmount() != null 
                ? contractService.getTotalContractAmount() : BigDecimal.ZERO);
        stats.put("customerSources", customerService.getCustomerSourceStats());
        stats.put("salesFunnel", salesOpportunityService.getSalesFunnelData());
        stats.put("upcomingFollowUps", customerService.getUpcomingFollowUps());
        
        return stats;
    }

    @GetMapping("/sales-funnel")
    public List<Object[]> getSalesFunnel() {
        return salesOpportunityService.getSalesFunnelData();
    }
}
