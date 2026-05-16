package com.example.leavesystem.repository;

import com.example.leavesystem.entity.LeaveApplication;
import com.example.leavesystem.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    
    List<LeaveApplication> findByStatusOrderByCreatedAtDesc(LeaveStatus status);
    
    List<LeaveApplication> findByStatusInOrderByCreatedAtDesc(List<LeaveStatus> statuses);
    
    List<LeaveApplication> findByStudentClassNameAndStatusOrderByCreatedAtDesc(String className, LeaveStatus status);
    
    List<LeaveApplication> findByStudentClassNameOrderByCreatedAtDesc(String className);
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.student.className = :className " +
           "AND la.startDate >= :startDate AND la.endDate <= :endDate ORDER BY la.createdAt DESC")
    List<LeaveApplication> findByClassNameAndDateRange(
            @Param("className") String className,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT la FROM LeaveApplication la WHERE la.status = :status " +
           "AND (la.firstApprover.id = :teacherId OR la.secondApprover.id = :teacherId)")
    List<LeaveApplication> findByStatusAndTeacherId(
            @Param("status") LeaveStatus status,
            @Param("teacherId") Long teacherId
    );
    
    @Query("SELECT COUNT(la) FROM LeaveApplication la WHERE la.student.className = :className " +
           "AND la.status = com.example.leavesystem.enums.LeaveStatus.APPROVED " +
           "AND la.startDate >= :startDate AND la.endDate <= :endDate")
    long countApprovedByClassAndDateRange(
            @Param("className") String className,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT la.student.className, COUNT(la) FROM LeaveApplication la " +
           "WHERE la.status = com.example.leavesystem.enums.LeaveStatus.APPROVED " +
           "AND la.startDate >= :startDate AND la.endDate <= :endDate " +
           "GROUP BY la.student.className")
    List<Object[]> countApprovedGroupByClass(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
