CREATE DATABASE IF NOT EXISTS charging_station DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE charging_station;

CREATE TABLE IF NOT EXISTS charging_stations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    status ENUM('online', 'offline', 'charging', 'error', 'idle') DEFAULT 'offline',
    power_capacity DECIMAL(10,2) DEFAULT 120.00,
    current_power DECIMAL(10,2) DEFAULT 0.00,
    voltage DECIMAL(10,2) DEFAULT 0.00,
    current DECIMAL(10,2) DEFAULT 0.00,
    temperature DECIMAL(5,2) DEFAULT 25.00,
    last_heartbeat DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_last_heartbeat (last_heartbeat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS charging_orders (
    id VARCHAR(50) PRIMARY KEY,
    station_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) DEFAULT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME DEFAULT NULL,
    start_energy DECIMAL(10,2) DEFAULT 0.00,
    end_energy DECIMAL(10,2) DEFAULT 0.00,
    total_energy DECIMAL(10,2) DEFAULT 0.00,
    price_per_kwh DECIMAL(10,4) DEFAULT 1.5000,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('charging', 'completed', 'cancelled', 'error') DEFAULT 'charging',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_station_id (station_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS power_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id VARCHAR(50) NOT NULL,
    power DECIMAL(10,2) NOT NULL,
    voltage DECIMAL(10,2) DEFAULT 0.00,
    current DECIMAL(10,2) DEFAULT 0.00,
    temperature DECIMAL(5,2) DEFAULT 0.00,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_station_time (station_id, recorded_at),
    INDEX idx_recorded_at (recorded_at),
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alarms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id VARCHAR(50) NOT NULL,
    alarm_type VARCHAR(50) NOT NULL,
    alarm_level ENUM('info', 'warning', 'critical') DEFAULT 'warning',
    message VARCHAR(255) NOT NULL,
    acknowledged BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_station_id (station_id),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS control_commands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    station_id VARCHAR(50) NOT NULL,
    command_type VARCHAR(50) NOT NULL,
    command_data JSON DEFAULT NULL,
    status ENUM('pending', 'sent', 'success', 'failed') DEFAULT 'pending',
    result_message VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    executed_at DATETIME DEFAULT NULL,
    INDEX idx_station_id (station_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO charging_stations (id, name, location, status, power_capacity) VALUES
('CS001', '充电桩1号', '东区停车场入口', 'idle', 120.00),
('CS002', '充电桩2号', '东区停车场入口', 'idle', 120.00),
('CS003', '充电桩3号', '西区停车场', 'idle', 120.00),
('CS004', '充电桩4号', '西区停车场', 'idle', 60.00),
('CS005', '充电桩5号', '南区充电站', 'idle', 120.00),
('CS006', '充电桩6号', '南区充电站', 'idle', 60.00),
('CS007', '充电桩7号', '北区服务站', 'idle', 120.00),
('CS008', '充电桩8号', '北区服务站', 'idle', 120.00);
