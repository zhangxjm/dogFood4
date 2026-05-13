package com.meeting.repository;

import com.meeting.entity.Booking;
import com.meeting.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingDateDescStartTimeDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId AND b.bookingDate = :date " +
           "AND b.status IN ('PENDING', 'APPROVED')")
    List<Booking> findConflictingBookings(@Param("roomId") Long roomId, @Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.status IN ('PENDING', 'APPROVED') " +
           "AND b.bookingDate = :date " +
           "AND ((:startTime < b.endTime AND :endTime > b.startTime))")
    List<Booking> findTimeConflicts(@Param("date") LocalDate date, 
                                    @Param("startTime") LocalTime startTime,
                                    @Param("endTime") LocalTime endTime);

    List<Booking> findByStatus(Booking.BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' " +
           "AND b.bookingDate = :date " +
           "AND (b.reminderSent = false OR b.reminderSent IS NULL)")
    List<Booking> findUpcomingAppointments(@Param("date") LocalDate date);

    List<Booking> findByUser(User user);
}
