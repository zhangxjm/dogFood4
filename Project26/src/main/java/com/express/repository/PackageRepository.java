package com.express.repository;

import com.express.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long>, JpaSpecificationExecutor<Package> {
    
    Optional<Package> findByTrackingNumber(String trackingNumber);
    
    List<Package> findByRecipientContainingIgnoreCase(String recipient);
    
    List<Package> findByStatus(Package.PackageStatus status);
    
    boolean existsByTrackingNumber(String trackingNumber);
}
