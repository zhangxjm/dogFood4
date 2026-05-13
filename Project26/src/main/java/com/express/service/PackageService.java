package com.express.service;

import com.express.entity.Package;
import com.express.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PackageService {
    
    @Autowired
    private PackageRepository packageRepository;
    
    public List<Package> getAllPackages() {
        return packageRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }
    
    public Optional<Package> getPackageById(Long id) {
        return packageRepository.findById(id);
    }
    
    public Optional<Package> getPackageByTrackingNumber(String trackingNumber) {
        return packageRepository.findByTrackingNumber(trackingNumber);
    }
    
    @Transactional
    public Package registerPackage(Package pkg) {
        if (packageRepository.existsByTrackingNumber(pkg.getTrackingNumber())) {
            throw new RuntimeException("快递单号已存在：" + pkg.getTrackingNumber());
        }
        pkg.setStatus(Package.PackageStatus.REGISTERED);
        return packageRepository.save(pkg);
    }
    
    @Transactional
    public Package inStorage(Long id, String location, String operator) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("包裹不存在"));
        
        if (pkg.getStatus() == Package.PackageStatus.IN_STORAGE) {
            throw new RuntimeException("包裹已在库中");
        }
        if (pkg.getStatus() == Package.PackageStatus.PICKED_UP) {
            throw new RuntimeException("包裹已被取走");
        }
        
        pkg.setStatus(Package.PackageStatus.IN_STORAGE);
        pkg.setLocation(location);
        pkg.setInTime(LocalDateTime.now());
        pkg.setOperator(operator);
        return packageRepository.save(pkg);
    }
    
    @Transactional
    public Package inStorageByTrackingNumber(String trackingNumber, String location, String operator) {
        Package pkg = packageRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("包裹不存在"));
        
        if (pkg.getStatus() == Package.PackageStatus.IN_STORAGE) {
            throw new RuntimeException("包裹已在库中");
        }
        if (pkg.getStatus() == Package.PackageStatus.PICKED_UP) {
            throw new RuntimeException("包裹已被取走");
        }
        
        pkg.setStatus(Package.PackageStatus.IN_STORAGE);
        pkg.setLocation(location);
        pkg.setInTime(LocalDateTime.now());
        pkg.setOperator(operator);
        return packageRepository.save(pkg);
    }
    
    @Transactional
    public Package pickUp(Long id, String outOperator) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("包裹不存在"));
        
        if (pkg.getStatus() == Package.PackageStatus.REGISTERED) {
            throw new RuntimeException("包裹尚未入库");
        }
        if (pkg.getStatus() == Package.PackageStatus.PICKED_UP) {
            throw new RuntimeException("包裹已被取走");
        }
        
        pkg.setStatus(Package.PackageStatus.PICKED_UP);
        pkg.setOutTime(LocalDateTime.now());
        pkg.setOutOperator(outOperator);
        return packageRepository.save(pkg);
    }
    
    @Transactional
    public Package pickUpByTrackingNumber(String trackingNumber, String outOperator) {
        Package pkg = packageRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new RuntimeException("包裹不存在"));
        
        if (pkg.getStatus() == Package.PackageStatus.REGISTERED) {
            throw new RuntimeException("包裹尚未入库");
        }
        if (pkg.getStatus() == Package.PackageStatus.PICKED_UP) {
            throw new RuntimeException("包裹已被取走");
        }
        
        pkg.setStatus(Package.PackageStatus.PICKED_UP);
        pkg.setOutTime(LocalDateTime.now());
        pkg.setOutOperator(outOperator);
        return packageRepository.save(pkg);
    }
    
    public List<Package> searchPackages(String keyword, Package.PackageStatus status) {
        Specification<Package> spec = Specification.where(null);
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            String kw = keyword.trim();
            spec = spec.and((root, query, cb) -> 
                cb.or(
                    cb.like(root.get("trackingNumber"), "%" + kw + "%"),
                    cb.like(root.get("recipient"), "%" + kw + "%"),
                    cb.like(root.get("phone"), "%" + kw + "%")
                )
            );
        }
        
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        
        return packageRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "id"));
    }
    
    @Transactional
    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }
    
    @Transactional
    public Package updatePackage(Long id, Package updatedPkg) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("包裹不存在"));
        
        if (updatedPkg.getRecipient() != null) {
            pkg.setRecipient(updatedPkg.getRecipient());
        }
        if (updatedPkg.getPhone() != null) {
            pkg.setPhone(updatedPkg.getPhone());
        }
        if (updatedPkg.getExpressCompany() != null) {
            pkg.setExpressCompany(updatedPkg.getExpressCompany());
        }
        if (updatedPkg.getLocation() != null) {
            pkg.setLocation(updatedPkg.getLocation());
        }
        if (updatedPkg.getRemark() != null) {
            pkg.setRemark(updatedPkg.getRemark());
        }
        
        return packageRepository.save(pkg);
    }
}
