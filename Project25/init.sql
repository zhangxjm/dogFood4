SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
CREATE DATABASE IF NOT EXISTS club_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE club_management;

CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    gender VARCHAR(10),
    grade VARCHAR(50),
    major VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    department_id INT,
    position VARCHAR(100),
    join_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS transition_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transition_id INT NOT NULL,
    member_id INT NOT NULL,
    old_position VARCHAR(100),
    new_position VARCHAR(100),
    old_department_id INT,
    new_department_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transition_id) REFERENCES transitions(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (old_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (new_department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO departments (name, description) VALUES 
('主席团', '社团核心管理层'),
('秘书处', '负责社团日常事务和文档管理'),
('宣传部', '负责社团宣传和活动推广'),
('组织部', '负责社团活动组织和策划'),
('外联部', '负责对外联络和资源整合'),
('技术部', '负责技术支持和开发工作');
