package com.meeting.controller;

import com.meeting.entity.MeetingRoom;
import com.meeting.service.MeetingRoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class MeetingRoomController {

    @Autowired
    private MeetingRoomService meetingRoomService;

    @GetMapping
    public ResponseEntity<List<MeetingRoom>> getAllRooms() {
        return ResponseEntity.ok(meetingRoomService.findAll());
    }

    @GetMapping("/available")
    public ResponseEntity<List<MeetingRoom>> getAvailableRooms() {
        return ResponseEntity.ok(meetingRoomService.findAvailable());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeetingRoom> getRoomById(@PathVariable Long id) {
        Optional<MeetingRoom> room = meetingRoomService.findById(id);
        return room.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeetingRoom> createRoom(@RequestBody MeetingRoom room) {
        return ResponseEntity.ok(meetingRoomService.save(room));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MeetingRoom> updateRoom(@PathVariable Long id, @RequestBody MeetingRoom roomDetails) {
        Optional<MeetingRoom> roomOpt = meetingRoomService.findById(id);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        MeetingRoom room = roomOpt.get();
        room.setName(roomDetails.getName());
        room.setCapacity(roomDetails.getCapacity());
        room.setLocation(roomDetails.getLocation());
        room.setDescription(roomDetails.getDescription());
        room.setStatus(roomDetails.getStatus());

        return ResponseEntity.ok(meetingRoomService.save(room));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        Optional<MeetingRoom> room = meetingRoomService.findById(id);
        if (!room.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        meetingRoomService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
