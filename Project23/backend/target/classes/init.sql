CREATE DATABASE IF NOT EXISTS gym_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gym_reservation;

CREATE TABLE IF NOT EXISTS member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    course_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_capacity INT NOT NULL DEFAULT 10,
    description TEXT,
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS reservation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    reservation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (member_id) REFERENCES member(id),
    FOREIGN KEY (course_id) REFERENCES course(id),
    UNIQUE KEY unique_reservation (member_id, course_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO member (name, phone) VALUES 
('张三', '13800138001'),
('李四', '13800138002'),
('王五', '13800138003');

INSERT IGNORE INTO course (name, instructor, course_date, start_time, end_time, max_capacity, description, status) VALUES 
('瑜伽入门', '王教练', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', 15, '适合零基础学员的瑜伽基础课程', 'AVAILABLE'),
('动感单车', '李教练', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '19:00:00', 20, '高强度有氧训练，燃烧脂肪', 'AVAILABLE'),
('普拉提', '张教练', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', '11:00:00', 12, '核心力量训练，改善体态', 'AVAILABLE'),
('力量训练', '赵教练', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:30:00', 10, '全身力量训练，增肌塑形', 'AVAILABLE'),
('有氧操', '刘教练', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '17:00:00', '18:00:00', 25, '欢快的有氧舞蹈课程', 'AVAILABLE');
