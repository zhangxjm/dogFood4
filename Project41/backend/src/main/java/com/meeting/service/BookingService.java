package com.meeting.service;

import com.meeting.entity.Booking;
import com.meeting.entity.MeetingRoom;
import com.meeting.entity.User;
import com.meeting.repository.BookingRepository;
import com.meeting.repository.MeetingRoomRepository;
import com.meeting.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private MeetingRoomRepository meetingRoomRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean hasTimeConflict(Long roomId, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
        List<Booking> existingBookings = bookingRepository.findConflictingBookings(roomId, date);

        for (Booking booking : existingBookings) {
            if (excludeBookingId != null && booking.getId().equals(excludeBookingId)) {
                continue;
            }

            if (isOverlapping(startTime, endTime, booking.getStartTime(), booking.getEndTime())) {
                return true;
            }
        }
        return false;
    }

    private boolean isOverlapping(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return !start1.isAfter(end2) && !end1.isBefore(start2);
    }

    public List<Booking> findConflictingBookings(Long roomId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Booking> allBookings = bookingRepository.findConflictingBookings(roomId, date);
        List<Booking> conflicts = new ArrayList<>();

        for (Booking booking : allBookings) {
            if (isOverlapping(startTime, endTime, booking.getStartTime(), booking.getEndTime())) {
                conflicts.add(booking);
            }
        }
        return conflicts;
    }

    public List<LocalTime[]> getAvailableTimeSlots(Long roomId, LocalDate date) {
        List<Booking> bookings = bookingRepository.findConflictingBookings(roomId, date);
        List<LocalTime[]> availableSlots = new ArrayList<>();

        LocalTime currentTime = LocalTime.of(8, 0);
        LocalTime endOfDay = LocalTime.of(20, 0);

        bookings.sort((b1, b2) -> b1.getStartTime().compareTo(b2.getStartTime()));

        for (Booking booking : bookings) {
            if (currentTime.isBefore(booking.getStartTime())) {
                availableSlots.add(new LocalTime[]{currentTime, booking.getStartTime()});
            }
            if (booking.getEndTime().isAfter(currentTime)) {
                currentTime = booking.getEndTime();
            }
        }

        if (currentTime.isBefore(endOfDay)) {
            availableSlots.add(new LocalTime[]{currentTime, endOfDay});
        }

        return availableSlots;
    }

    @Transactional
    public Booking createBooking(Long roomId, Long userId, LocalDate date, LocalTime startTime, 
                                  LocalTime endTime, String title, String description) {
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new RuntimeException("开始时间必须早于结束时间");
        }

        if (startTime.isBefore(LocalTime.of(8, 0)) || endTime.isAfter(LocalTime.of(20, 0))) {
            throw new RuntimeException("预约时间必须在 08:00 - 20:00 之间");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new RuntimeException("不能预约过去的日期");
        }

        Optional<MeetingRoom> roomOpt = meetingRoomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            throw new RuntimeException("会议室不存在");
        }

        MeetingRoom room = roomOpt.get();
        if (room.getStatus() != MeetingRoom.RoomStatus.AVAILABLE) {
            throw new RuntimeException("该会议室当前不可用");
        }

        if (hasTimeConflict(roomId, date, startTime, endTime, null)) {
            throw new RuntimeException("该时间段已被预约");
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new RuntimeException("用户不存在");
        }

        Booking booking = new Booking();
        booking.setRoom(room);
        booking.setUser(userOpt.get());
        booking.setBookingDate(date);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setTitle(title);
        booking.setDescription(description);
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setReminderSent(false);

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking approveBooking(Long bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (!bookingOpt.isPresent()) {
            throw new RuntimeException("预约不存在");
        }

        Booking booking = bookingOpt.get();
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("只能审批待处理的预约");
        }

        if (hasTimeConflict(booking.getRoom().getId(), booking.getBookingDate(), 
                           booking.getStartTime(), booking.getEndTime(), bookingId)) {
            throw new RuntimeException("该时间段已被其他预约占用");
        }

        booking.setStatus(Booking.BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking rejectBooking(Long bookingId, String reason) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (!bookingOpt.isPresent()) {
            throw new RuntimeException("预约不存在");
        }

        Booking booking = bookingOpt.get();
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("只能拒绝待处理的预约");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectReason(reason);
        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, Long userId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (!bookingOpt.isPresent()) {
            throw new RuntimeException("预约不存在");
        }

        Booking booking = bookingOpt.get();
        if (!booking.getUser().getId().equals(userId) && 
            booking.getUser().getRole() != User.Role.ADMIN) {
            throw new RuntimeException("只能取消自己的预约");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED || 
            booking.getStatus() == Booking.BookingStatus.REJECTED) {
            throw new RuntimeException("该预约已被取消或拒绝");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public List<Booking> findByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingDateDescStartTimeDesc(userId);
    }

    public List<Booking> findPending() {
        return bookingRepository.findByStatus(Booking.BookingStatus.PENDING);
    }

    public List<Booking> findApproved() {
        return bookingRepository.findByStatus(Booking.BookingStatus.APPROVED);
    }

    public Optional<Booking> findById(Long id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> findUpcomingAppointments(LocalDate date) {
        return bookingRepository.findUpcomingAppointments(date);
    }

    @Transactional
    public void markReminderSent(Long bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            booking.setReminderSent(true);
            bookingRepository.save(booking);
        }
    }

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }
}
