CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '分类名称',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品分类表';

CREATE TABLE IF NOT EXISTS employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '员工姓名',
    employee_no VARCHAR(50) NOT NULL COMMENT '员工编号',
    department VARCHAR(100) COMMENT '部门',
    phone VARCHAR(20) COMMENT '联系电话',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_employee_no (employee_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

CREATE TABLE IF NOT EXISTS item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '物品名称',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    unit VARCHAR(20) DEFAULT '个' COMMENT '单位',
    quantity INT DEFAULT 0 COMMENT '库存数量',
    min_quantity INT DEFAULT 0 COMMENT '最低库存预警',
    location VARCHAR(100) COMMENT '存放位置',
    description VARCHAR(500) COMMENT '描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    KEY idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品库存表';

CREATE TABLE IF NOT EXISTS requisition_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL COMMENT '物品ID',
    employee_id BIGINT NOT NULL COMMENT '员工ID',
    quantity INT NOT NULL COMMENT '申领数量',
    purpose VARCHAR(500) COMMENT '申领用途',
    requisition_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申领时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    KEY idx_item_id (item_id),
    KEY idx_employee_id (employee_id),
    KEY idx_requisition_time (requisition_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='申领记录表';

INSERT INTO category (name, description) VALUES
('办公文具', '笔、纸、文件夹等日常办公文具'),
('电子设备', '电脑外设、U盘等电子设备'),
('清洁用品', '纸巾、清洁剂等清洁用品'),
('其他', '其他办公用品')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO employee (name, employee_no, department, phone) VALUES
('张三', 'EMP001', '行政部', '13800138001'),
('李四', 'EMP002', '技术部', '13800138002'),
('王五', 'EMP003', '财务部', '13800138003')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO item (name, category_id, unit, quantity, min_quantity, location, description) VALUES
('中性笔', 1, '支', 100, 20, 'A区-文具柜', '黑色中性笔'),
('A4打印纸', 1, '包', 50, 10, 'A区-文件柜', 'A4规格打印纸'),
('文件夹', 1, '个', 80, 15, 'A区-文具柜', '蓝色文件夹'),
('鼠标', 2, '个', 30, 5, 'B区-电子柜', '无线鼠标'),
('键盘', 2, '个', 20, 5, 'B区-电子柜', '机械键盘'),
('抽纸', 3, '盒', 100, 20, 'C区-清洁柜', '办公抽纸')
ON DUPLICATE KEY UPDATE name = VALUES(name);
