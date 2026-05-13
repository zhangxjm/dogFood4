package com.gym.reservation.repository;

import com.gym.reservation.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMemberIdOrderByReservationTimeDesc(Long memberId);
    List<Reservation> findByCourseIdAndStatus(Long courseId, String status);
    Long countByCourseIdAndStatus(Long courseId, String status);
    Optional<Reservation> findByMemberIdAndCourseIdAndStatus(Long memberId, Long courseId, String status);
    boolean existsByMemberIdAndCourseIdAndStatus(Long memberId, Long courseId, String status);
    List<Reservation> findByMemberIdAndStatusOrderByReservationTimeDesc(Long memberId, String status);
}
