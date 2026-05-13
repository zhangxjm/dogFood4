-- 创建数据库
CREATE DATABASE IF NOT EXISTS employee_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE employee_management;

-- 创建部门表
CREATE TABLE IF NOT EXISTS department (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '部门名称',
    description VARCHAR(500) COMMENT '部门描述',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部门表';

-- 创建员工表
CREATE TABLE IF NOT EXISTS employee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    gender VARCHAR(10) COMMENT '性别',
    birthday DATE COMMENT '生日',
    phone VARCHAR(20) COMMENT '电话',
    email VARCHAR(100) COMMENT '邮箱',
    address VARCHAR(300) COMMENT '地址',
    department_id BIGINT COMMENT '部门ID',
    position VARCHAR(100) COMMENT '职位',
    join_date DATE COMMENT '入职日期',
    status VARCHAR(20) DEFAULT '在职' COMMENT '状态：在职/离职',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表';

-- 初始化部门数据
INSERT INTO department (name, description) VALUES
('技术部', '负责公司技术研发和系统维护'),
('市场部', '负责产品推广和客户开发'),
('人力资源部', '负责招聘和员工关系管理'),
('财务部', '负责公司财务管理');

-- 初始化员工数据
INSERT INTO employee (name, gender, birthday, phone, email, address, department_id, position, join_date, status) VALUES
('张三', '男', '1990-05-15', '13800138001', 'zhangsan@example.com', '北京市朝阳区', 1, '高级工程师', '2020-03-01', '在职'),
('李四', '女', '1992-08-20', '13800138002', 'lisi@example.com', '北京市海淀区', 2, '市场经理', '2021-05-10', '在职'),
('王五', '男', '1988-11-05', '13800138003', 'wangwu@example.com', '北京市西城区', 1, '工程师', '2019-08-15', '在职'),
('赵六', '女', '1995-02-28', '13800138004', 'zhaoliu@example.com', '北京市东城区', 3, 'HR专员', '2022-01-20', '在职'),
('钱七', '男', '1985-07-12', '13800138005', 'qianqi@example.com', '北京市丰台区', 4, '财务主管', '2018-06-01', '在职');
