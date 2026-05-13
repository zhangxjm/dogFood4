package com.gym.reservation.controller;

import com.gym.reservation.common.Result;
import com.gym.reservation.dto.ReservationRequest;
import com.gym.reservation.entity.Reservation;
import com.gym.reservation.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    
    @Autowired
    private ReservationService reservationService;
    
    @GetMapping
    public Result<List<Reservation>> getAllReservations() {
        return Result.success(reservationService.getAllReservations());
    }
    
    @GetMapping("/member/{memberId}")
    public Result<List<Reservation>> getReservationsByMember(@PathVariable Long memberId) {
        return Result.success(reservationService.getReservationsByMember(memberId));
    }
    
    @GetMapping("/member/{memberId}/active")
    public Result<List<Reservation>> getActiveReservationsByMember(@PathVariable Long memberId) {
        return Result.success(reservationService.getActiveReservationsByMember(memberId));
    }
    
    @GetMapping("/{id}")
    public Result<Reservation> getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
            .map(Result::success)
            .orElse(Result.error("预约记录不存在"));
    }
    
    @PostMapping
    public Result<Reservation> createReservation(@Valid @RequestBody ReservationRequest request) {
        try {
            return Result.success(reservationService.createReservation(
                request.getMemberId(),
                request.getCourseId()
            ));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancel")
    public Result<Reservation> cancelReservation(@PathVariable Long id) {
        try {
            return Result.success(reservationService.cancelReservation(id));
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public Result<Void> deleteReservation(@PathVariable Long id) {
        try {
            reservationService.deleteReservation(id);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
}
