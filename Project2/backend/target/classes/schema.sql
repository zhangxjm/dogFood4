CREATE DATABASE IF NOT EXISTS asset_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE asset_management;

CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL COMMENT '部门名称',
    dept_code VARCHAR(50) NOT NULL COMMENT '部门编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父部门ID',
    leader_id BIGINT COMMENT '部门负责人ID',
    description VARCHAR(500) COMMENT '描述',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态 1正常 0禁用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_dept_code (dept_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    avatar VARCHAR(255) COMMENT '头像',
    dept_id BIGINT COMMENT '部门ID',
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' COMMENT '角色: ADMIN, EMPLOYEE',
    status TINYINT DEFAULT 1 COMMENT '状态 1正常 0禁用',
    last_login_time DATETIME COMMENT '最后登录时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_username (username),
    KEY idx_dept_id (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE IF NOT EXISTS asset_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) NOT NULL COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    description VARCHAR(500) COMMENT '描述',
    depreciation_rate DECIMAL(5,2) DEFAULT 0 COMMENT '折旧率%',
    useful_life INT DEFAULT 36 COMMENT '使用寿命(月)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT DEFAULT 1 COMMENT '状态',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_category_code (category_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产分类表';

CREATE TABLE IF NOT EXISTS assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(50) NOT NULL COMMENT '资产编号',
    asset_name VARCHAR(200) NOT NULL COMMENT '资产名称',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    spec VARCHAR(200) COMMENT '规格型号',
    brand VARCHAR(100) COMMENT '品牌',
    serial_number VARCHAR(100) COMMENT '序列号',
    purchase_date DATE COMMENT '购买日期',
    purchase_price DECIMAL(12,2) DEFAULT 0 COMMENT '购买价格',
    current_value DECIMAL(12,2) DEFAULT 0 COMMENT '当前价值',
    depreciation_value DECIMAL(12,2) DEFAULT 0 COMMENT '累计折旧',
    location VARCHAR(200) COMMENT '存放位置',
    dept_id BIGINT COMMENT '所属部门',
    keeper_id BIGINT COMMENT '保管人ID',
    user_id BIGINT COMMENT '使用人ID',
    status VARCHAR(20) DEFAULT 'STORED' COMMENT '状态: STORED(入库), IN_USE(领用), SCRAPPED(报废)',
    description VARCHAR(500) COMMENT '描述',
    image_url VARCHAR(255) COMMENT '图片',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE KEY uk_asset_code (asset_code),
    KEY idx_category_id (category_id),
    KEY idx_dept_id (dept_id),
    KEY idx_user_id (user_id),
    KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产表';

CREATE TABLE IF NOT EXISTS asset_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT NOT NULL COMMENT '资产ID',
    operation_type VARCHAR(30) NOT NULL COMMENT '操作类型: IN(入库), OUT(领用), RETURN(归还), SCRAP(报废)',
    operation_date DATETIME NOT NULL COMMENT '操作日期',
    operator_id BIGINT NOT NULL COMMENT '操作人ID',
    target_user_id BIGINT COMMENT '目标用户ID',
    dept_id BIGINT COMMENT '部门ID',
    quantity INT DEFAULT 1 COMMENT '数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_asset_id (asset_id),
    KEY idx_operator_id (operator_id),
    KEY idx_operation_type (operation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产操作记录表';

CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    module VARCHAR(50) COMMENT '模块',
    operation VARCHAR(100) COMMENT '操作',
    method VARCHAR(200) COMMENT '方法',
    params TEXT COMMENT '参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT '用户代理',
    status TINYINT DEFAULT 1 COMMENT '状态 1成功 0失败',
    error_msg VARCHAR(500) COMMENT '错误信息',
    cost_time BIGINT COMMENT '耗时(ms)',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id),
    KEY idx_module (module),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

INSERT INTO departments (dept_name, dept_code, parent_id, description, sort_order, status) VALUES
('总公司', 'HQ', 0, '总部', 0, 1),
('行政部', 'ADMIN', 1, '行政部门', 1, 1),
('技术部', 'TECH', 1, '技术部门', 2, 1),
('财务部', 'FINANCE', 1, '财务部门', 3, 1),
('市场部', 'MARKET', 1, '市场部门', 4, 1);

INSERT INTO asset_categories (category_name, category_code, parent_id, description, depreciation_rate, useful_life, sort_order, status) VALUES
('电子设备', 'ELECTRONIC', 0, '电子设备类', 16.67, 36, 1, 1),
('办公家具', 'FURNITURE', 0, '办公家具类', 10.00, 60, 2, 1),
('运输工具', 'VEHICLE', 0, '运输工具类', 16.67, 48, 3, 1),
('房屋建筑', 'BUILDING', 0, '房屋建筑类', 3.33, 240, 4, 1),
('电脑', 'COMPUTER', 1, '计算机设备', 33.33, 36, 1, 1),
('打印机', 'PRINTER', 1, '打印设备', 20.00, 60, 2, 1),
('办公桌', 'DESK', 2, '办公桌椅', 10.00, 60, 1, 1),
('办公椅', 'CHAIR', 2, '办公椅子', 10.00, 60, 2, 1);

INSERT INTO assets (asset_code, asset_name, category_id, spec, brand, serial_number, purchase_date, purchase_price, current_value, depreciation_value, location, status, description) VALUES
('PC-2024-001', '联想笔记本电脑', 5, 'ThinkPad X1 Carbon', '联想', 'SN10001', '2024-01-15', 8999.00, 8999.00, 0.00, '技术部办公室', 'STORED', '开发用笔记本电脑'),
('PC-2024-002', '戴尔台式电脑', 5, 'OptiPlex 7090', '戴尔', 'SN10002', '2024-02-01', 5999.00, 5999.00, 0.00, '技术部办公室', 'IN_USE', '员工办公电脑'),
('PRT-2024-001', '惠普打印机', 6, 'HP LaserJet Pro MFP', '惠普', 'SN10003', '2024-01-20', 3299.00, 3299.00, 0.00, '行政部办公室', 'STORED', '彩色激光打印机'),
('DSK-2024-001', '老板桌', 7, '2000*1000', '宜家', 'SN10004', '2024-01-01', 2500.00, 2500.00, 0.00, '总经理办公室', 'IN_USE', '实木老板桌');
