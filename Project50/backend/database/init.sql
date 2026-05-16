SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) UNIQUE,
    category VARCHAR(100),
    quantity INT DEFAULT 1,
    available INT DEFAULT 1,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS readers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    id_card VARCHAR(50) UNIQUE,
    type VARCHAR(50) DEFAULT '普通读者',
    max_borrow INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS borrow_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    reader_id INT NOT NULL,
    borrow_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT '借阅中',
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO books (title, author, isbn, category, quantity, available, location, description) VALUES
('深入理解计算机系统', 'Randal E.Bryant', '9787111544937', '计算机', 5, 5, 'A区-1排', '计算机系统领域经典教材'),
('Go语言实战', 'William Kennedy', '9787115422484', '计算机', 3, 3, 'A区-2排', 'Go语言入门到精通'),
('Vue.js设计与实现', '霍春阳', '9787115587060', '计算机', 4, 4, 'A区-3排', 'Vue.js核心原理'),
('红楼梦', '曹雪芹', '9787020002207', '文学', 2, 2, 'B区-1排', '中国古典文学名著'),
('三体', '刘慈欣', '9787536692930', '科幻', 6, 6, 'C区-1排', '中国科幻里程碑');

INSERT INTO readers (name, phone, email, id_card, type, max_borrow) VALUES
('张三', '13800138001', 'zhangsan@example.com', '110101199001010001', '教师', 10),
('李四', '13800138002', 'lisi@example.com', '110101199002020002', '学生', 5),
('王五', '13800138003', 'wangwu@example.com', '110101199003030003', '普通读者', 3);
