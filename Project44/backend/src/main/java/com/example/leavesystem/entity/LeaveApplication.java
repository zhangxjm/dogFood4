package com.example.leavesystem.entity;

import com.example.leavesystem.enums.LeaveStatus;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "leave_applications")
public class LeaveApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveTypeConfig leaveType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "first_approver_id")
    private User firstApprover;

    private String firstApproveComment;

    private LocalDateTime firstApproveTime;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "second_approver_id")
    private User secondApprover;

    private String secondApproveComment;

    private LocalDateTime secondApproveTime;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public int getDays() {
        if (startDate == null || endDate == null) return 0;
        return (int) (endDate.toEpochDay() - startDate.toEpochDay() + 1);
    }
}
