package com.express.controller;

import com.express.entity.Package;
import com.express.service.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin
public class PackageController {
    
    @Autowired
    private PackageService packageService;
    
    @GetMapping
    public ResponseEntity<List<Package>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Package> getPackageById(@PathVariable Long id) {
        return packageService.getPackageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<Package> getPackageByTrackingNumber(@PathVariable String trackingNumber) {
        return packageService.getPackageByTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> registerPackage(@RequestBody Package pkg) {
        try {
            return ResponseEntity.ok(packageService.registerPackage(pkg));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @PostMapping("/{id}/in-storage")
    public ResponseEntity<?> inStorage(
            @PathVariable Long id,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String operator) {
        try {
            return ResponseEntity.ok(packageService.inStorage(id, location, operator));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @PostMapping("/tracking/{trackingNumber}/in-storage")
    public ResponseEntity<?> inStorageByTrackingNumber(
            @PathVariable String trackingNumber,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String operator) {
        try {
            return ResponseEntity.ok(packageService.inStorageByTrackingNumber(trackingNumber, location, operator));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @PostMapping("/{id}/pick-up")
    public ResponseEntity<?> pickUp(
            @PathVariable Long id,
            @RequestParam(required = false) String outOperator) {
        try {
            return ResponseEntity.ok(packageService.pickUp(id, outOperator));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @PostMapping("/tracking/{trackingNumber}/pick-up")
    public ResponseEntity<?> pickUpByTrackingNumber(
            @PathVariable String trackingNumber,
            @RequestParam(required = false) String outOperator) {
        try {
            return ResponseEntity.ok(packageService.pickUpByTrackingNumber(trackingNumber, outOperator));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Package>> searchPackages(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Package.PackageStatus status) {
        return ResponseEntity.ok(packageService.searchPackages(keyword, status));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePackage(@PathVariable Long id, @RequestBody Package pkg) {
        try {
            return ResponseEntity.ok(packageService.updatePackage(id, pkg));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.ok().build();
    }
}
