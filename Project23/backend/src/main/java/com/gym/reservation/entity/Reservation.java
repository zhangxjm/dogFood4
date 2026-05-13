package com.gym.reservation.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reservation")
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "member_id", nullable = false)
    private Long memberId;
    
    @Column(name = "course_id", nullable = false)
    private Long courseId;
    
    @Column(name = "reservation_time", updatable = false)
    private LocalDateTime reservationTime;
    
    @Column(length = 20)
    private String status = "ACTIVE";
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", insertable = false, updatable = false)
    private Course course;
    
    @PrePersist
    protected void onCreate() {
        reservationTime = LocalDateTime.now();
    }
}
