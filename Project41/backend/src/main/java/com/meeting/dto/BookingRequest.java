package com.meeting.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long roomId;
    private String bookingDate;
    private String startTime;
    private String endTime;
    private String title;
    private String description;
}
