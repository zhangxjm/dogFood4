package com.meeting.entity;

import lombok.Data;

import javax.persistence.*;

@Data
@Entity
@Table(name = "meeting_rooms")
public class MeetingRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer capacity;

    @Column
    private String location;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomStatus status;

    public enum RoomStatus {
        AVAILABLE,
        MAINTENANCE
    }
}
