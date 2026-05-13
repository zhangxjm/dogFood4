package com.meeting.service;

import com.meeting.entity.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ReminderService.class);

    @Autowired
    private BookingService bookingService;

    @Scheduled(fixedRate = 60000)
    public void sendMeetingReminders() {
        LocalDate today = LocalDate.now();
        List<Booking> upcomingBookings = bookingService.findUpcomingAppointments(today);

        for (Booking booking : upcomingBookings) {
            logger.info("会议提醒 - 会议: {}, 时间: {} {}, 会议室: {}, 参会人: {}",
                    booking.getTitle(),
                    booking.getBookingDate(),
                    booking.getStartTime(),
                    booking.getRoom().getName(),
                    booking.getUser().getName());

            bookingService.markReminderSent(booking.getId());
        }

        if (!upcomingBookings.isEmpty()) {
            logger.info("已处理 {} 个会议提醒", upcomingBookings.size());
        }
    }
}
