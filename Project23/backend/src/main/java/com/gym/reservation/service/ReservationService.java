package com.gym.reservation.service;

import com.gym.reservation.entity.Reservation;
import com.gym.reservation.repository.CourseRepository;
import com.gym.reservation.repository.MemberRepository;
import com.gym.reservation.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
    
    public List<Reservation> getReservationsByMember(Long memberId) {
        return reservationRepository.findByMemberIdOrderByReservationTimeDesc(memberId);
    }
    
    public List<Reservation> getActiveReservationsByMember(Long memberId) {
        return reservationRepository.findByMemberIdAndStatusOrderByReservationTimeDesc(memberId, "ACTIVE");
    }
    
    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }
    
    @Transactional
    public Reservation createReservation(Long memberId, Long courseId) {
        if (!memberRepository.existsById(memberId)) {
            throw new RuntimeException("会员不存在");
        }
        
        if (!courseRepository.existsById(courseId)) {
            throw new RuntimeException("课程不存在");
        }
        
        if (reservationRepository.existsByMemberIdAndCourseIdAndStatus(memberId, courseId, "ACTIVE")) {
            throw new RuntimeException("您已预约该课程");
        }
        
        Long reservedCount = reservationRepository.countByCourseIdAndStatus(courseId, "ACTIVE");
        Integer maxCapacity = courseRepository.findById(courseId).get().getMaxCapacity();
        
        if (reservedCount >= maxCapacity) {
            throw new RuntimeException("该课程已约满");
        }
        
        Reservation reservation = new Reservation();
        reservation.setMemberId(memberId);
        reservation.setCourseId(courseId);
        reservation.setStatus("ACTIVE");
        
        return reservationRepository.save(reservation);
    }
    
    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        return reservationRepository.findById(reservationId)
            .map(reservation -> {
                if (!"ACTIVE".equals(reservation.getStatus())) {
                    throw new RuntimeException("预约已取消或已结束");
                }
                reservation.setStatus("CANCELLED");
                reservation.setCancelledAt(LocalDateTime.now());
                return reservationRepository.save(reservation);
            })
            .orElseThrow(() -> new RuntimeException("预约记录不存在"));
    }
    
    @Transactional
    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new RuntimeException("预约记录不存在");
        }
        reservationRepository.deleteById(id);
    }
}
