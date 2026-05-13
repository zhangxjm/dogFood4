package com.meeting.service;

import com.meeting.entity.MeetingRoom;
import com.meeting.repository.MeetingRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
public class MeetingRoomService {

    @Autowired
    private MeetingRoomRepository meetingRoomRepository;

    @PostConstruct
    public void init() {
        if (meetingRoomRepository.count() == 0) {
            MeetingRoom room1 = new MeetingRoom();
            room1.setName("小会议室 A");
            room1.setCapacity(6);
            room1.setLocation("1楼东侧");
            room1.setDescription("小型会议室，适合6人以下的小组讨论");
            room1.setStatus(MeetingRoom.RoomStatus.AVAILABLE);
            meetingRoomRepository.save(room1);

            MeetingRoom room2 = new MeetingRoom();
            room2.setName("中型会议室 B");
            room2.setCapacity(12);
            room2.setLocation("2楼中央");
            room2.setDescription("中型会议室，配备投影仪和白板");
            room2.setStatus(MeetingRoom.RoomStatus.AVAILABLE);
            meetingRoomRepository.save(room2);

            MeetingRoom room3 = new MeetingRoom();
            room3.setName("大型会议室 C");
            room3.setCapacity(30);
            room3.setLocation("3楼西侧");
            room3.setDescription("大型会议室，配备视频会议系统");
            room3.setStatus(MeetingRoom.RoomStatus.AVAILABLE);
            meetingRoomRepository.save(room3);

            MeetingRoom room4 = new MeetingRoom();
            room4.setName("培训室 D");
            room4.setCapacity(50);
            room4.setLocation("4楼");
            room4.setDescription("培训专用会议室");
            room4.setStatus(MeetingRoom.RoomStatus.MAINTENANCE);
            meetingRoomRepository.save(room4);
        }
    }

    public List<MeetingRoom> findAll() {
        return meetingRoomRepository.findAll();
    }

    public List<MeetingRoom> findAvailable() {
        return meetingRoomRepository.findByStatus(MeetingRoom.RoomStatus.AVAILABLE);
    }

    public Optional<MeetingRoom> findById(Long id) {
        return meetingRoomRepository.findById(id);
    }

    public MeetingRoom save(MeetingRoom room) {
        return meetingRoomRepository.save(room);
    }

    public void deleteById(Long id) {
        meetingRoomRepository.deleteById(id);
    }
}
