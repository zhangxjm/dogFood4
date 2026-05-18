package com.example.leavesystem.repository;

import com.example.leavesystem.entity.LeaveTypeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeConfigRepository extends JpaRepository<LeaveTypeConfig, Long> {
    List<LeaveTypeConfig> findByEnabledTrue();

    Optional<LeaveTypeConfig> findByTypeCode(String typeCode);

    Optional<LeaveTypeConfig> findByTypeName(String typeName);

    boolean existsByTypeCode(String typeCode);

    boolean existsByTypeName(String typeName);
}