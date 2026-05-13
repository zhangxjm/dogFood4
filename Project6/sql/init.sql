CREATE DATABASE IF NOT EXISTS erp_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE erp_db;

CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL COMMENT '分类名称',
    category_code VARCHAR(50) COMMENT '分类编码',
    parent_id BIGINT DEFAULT 0 COMMENT '父分类ID',
    sort INT DEFAULT 0 COMMENT '排序',
    remark VARCHAR(500) COMMENT '备注',
    status INT DEFAULT 1 COMMENT '状态：0禁用，1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

CREATE TABLE IF NOT EXISTS product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) COMMENT '商品编码',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    category_id BIGINT COMMENT '分类ID',
    unit VARCHAR(20) COMMENT '单位',
    purchase_price DECIMAL(12,2) DEFAULT 0 COMMENT '进货价',
    sale_price DECIMAL(12,2) DEFAULT 0 COMMENT '批发价',
    retail_price DECIMAL(12,2) DEFAULT 0 COMMENT '零售价',
    min_stock INT DEFAULT 10 COMMENT '最低库存预警',
    max_stock INT DEFAULT 1000 COMMENT '最高库存预警',
    specification VARCHAR(200) COMMENT '规格',
    brand VARCHAR(100) COMMENT '品牌',
    origin VARCHAR(100) COMMENT '产地',
    barcode VARCHAR(100) COMMENT '条形码',
    remark VARCHAR(500) COMMENT '备注',
    status INT DEFAULT 1 COMMENT '状态：0下架，1上架',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_product_code (product_code),
    INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

CREATE TABLE IF NOT EXISTS warehouse (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_code VARCHAR(50) COMMENT '仓库编码',
    warehouse_name VARCHAR(100) NOT NULL COMMENT '仓库名称',
    address VARCHAR(300) COMMENT '地址',
    manager VARCHAR(50) COMMENT '管理员',
    phone VARCHAR(20) COMMENT '联系电话',
    remark VARCHAR(500) COMMENT '备注',
    status INT DEFAULT 1 COMMENT '状态：0禁用，1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='仓库表';

CREATE TABLE IF NOT EXISTS supplier (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(50) COMMENT '供应商编码',
    supplier_name VARCHAR(200) NOT NULL COMMENT '供应商名称',
    contact VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(300) COMMENT '地址',
    email VARCHAR(100) COMMENT '邮箱',
    bank_name VARCHAR(100) COMMENT '开户银行',
    bank_account VARCHAR(50) COMMENT '银行账号',
    credit_limit DECIMAL(12,2) DEFAULT 0 COMMENT '信用额度',
    remark VARCHAR(500) COMMENT '备注',
    status INT DEFAULT 1 COMMENT '状态：0禁用，1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='供应商表';

CREATE TABLE IF NOT EXISTS customer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code VARCHAR(50) COMMENT '客户编码',
    customer_name VARCHAR(200) NOT NULL COMMENT '客户名称',
    contact VARCHAR(50) COMMENT '联系人',
    phone VARCHAR(20) COMMENT '联系电话',
    address VARCHAR(300) COMMENT '地址',
    email VARCHAR(100) COMMENT '邮箱',
    bank_name VARCHAR(100) COMMENT '开户银行',
    bank_account VARCHAR(50) COMMENT '银行账号',
    credit_limit DECIMAL(12,2) DEFAULT 0 COMMENT '信用额度',
    remark VARCHAR(500) COMMENT '备注',
    status INT DEFAULT 1 COMMENT '状态：0禁用，1启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户表';

CREATE TABLE IF NOT EXISTS purchase_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL COMMENT '采购订单号',
    supplier_id BIGINT COMMENT '供应商ID',
    warehouse_id BIGINT COMMENT '仓库ID',
    order_date DATETIME COMMENT '订单日期',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '订单总金额',
    paid_amount DECIMAL(12,2) DEFAULT 0 COMMENT '已付金额',
    unpaid_amount DECIMAL(12,2) DEFAULT 0 COMMENT '未付金额',
    status INT DEFAULT 0 COMMENT '状态：0草稿，1已审核，2已入库，3已完成',
    operator VARCHAR(50) COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_supplier_id (supplier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采购订单表';

CREATE TABLE IF NOT EXISTS purchase_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '订单号',
    product_id BIGINT COMMENT '商品ID',
    product_code VARCHAR(50) COMMENT '商品编码',
    product_name VARCHAR(200) COMMENT '商品名称',
    unit VARCHAR(20) COMMENT '单位',
    quantity INT DEFAULT 0 COMMENT '数量',
    price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    amount DECIMAL(12,2) DEFAULT 0 COMMENT '金额',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采购订单明细表';

CREATE TABLE IF NOT EXISTS sales_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL COMMENT '销售订单号',
    customer_id BIGINT COMMENT '客户ID',
    warehouse_id BIGINT COMMENT '仓库ID',
    order_date DATETIME COMMENT '订单日期',
    total_amount DECIMAL(12,2) DEFAULT 0 COMMENT '订单总金额',
    received_amount DECIMAL(12,2) DEFAULT 0 COMMENT '已收金额',
    uncollected_amount DECIMAL(12,2) DEFAULT 0 COMMENT '未收金额',
    status INT DEFAULT 0 COMMENT '状态：0草稿，1已审核，2已出库，3已完成',
    operator VARCHAR(50) COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单表';

CREATE TABLE IF NOT EXISTS sales_order_detail (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL COMMENT '订单ID',
    order_no VARCHAR(50) NOT NULL COMMENT '订单号',
    product_id BIGINT COMMENT '商品ID',
    product_code VARCHAR(50) COMMENT '商品编码',
    product_name VARCHAR(200) COMMENT '商品名称',
    unit VARCHAR(20) COMMENT '单位',
    quantity INT DEFAULT 0 COMMENT '数量',
    price DECIMAL(12,2) DEFAULT 0 COMMENT '单价',
    amount DECIMAL(12,2) DEFAULT 0 COMMENT '金额',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='销售订单明细表';

CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT COMMENT '仓库ID',
    product_id BIGINT COMMENT '商品ID',
    product_code VARCHAR(50) COMMENT '商品编码',
    product_name VARCHAR(200) COMMENT '商品名称',
    quantity INT DEFAULT 0 COMMENT '库存数量',
    locked_quantity INT DEFAULT 0 COMMENT '锁定数量',
    available_quantity INT DEFAULT 0 COMMENT '可用数量',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    UNIQUE KEY uk_warehouse_product (warehouse_id, product_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存表';

CREATE TABLE IF NOT EXISTS inventory_alert (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    warehouse_id BIGINT COMMENT '仓库ID',
    warehouse_name VARCHAR(100) COMMENT '仓库名称',
    product_id BIGINT COMMENT '商品ID',
    product_code VARCHAR(50) COMMENT '商品编码',
    product_name VARCHAR(200) COMMENT '商品名称',
    alert_type INT COMMENT '预警类型：1库存不足，2库存超量',
    current_stock INT COMMENT '当前库存',
    threshold INT COMMENT '阈值',
    status INT DEFAULT 0 COMMENT '状态：0未处理，1已处理',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    INDEX idx_status (status),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='库存预警表';

CREATE TABLE IF NOT EXISTS financial_voucher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_no VARCHAR(50) NOT NULL COMMENT '凭证号',
    voucher_type INT COMMENT '凭证类型：1收款，2付款',
    business_order_no VARCHAR(50) COMMENT '业务订单号',
    business_order_id BIGINT COMMENT '业务订单ID',
    party_id BIGINT COMMENT '往来单位ID',
    party_name VARCHAR(200) COMMENT '往来单位名称',
    party_type INT COMMENT '往来单位类型：1供应商，2客户',
    amount DECIMAL(12,2) DEFAULT 0 COMMENT '金额',
    payment_method VARCHAR(50) COMMENT '支付方式',
    voucher_date DATETIME COMMENT '凭证日期',
    operator VARCHAR(50) COMMENT '操作人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted INT DEFAULT 0,
    UNIQUE KEY uk_voucher_no (voucher_no),
    INDEX idx_business_order_no (business_order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务凭证表';

INSERT INTO warehouse (warehouse_code, warehouse_name, address, manager, phone) VALUES
('W001', '主仓库', '北京市朝阳区建国路88号', '张三', '13800138001'),
('W002', '备用仓库', '北京市海淀区中关村大街1号', '李四', '13800138002');

INSERT INTO category (category_name, category_code, sort) VALUES
('食品饮料', 'C001', 1),
('日用百货', 'C002', 2),
('办公用品', 'C003', 3),
('电子产品', 'C004', 4);

INSERT INTO supplier (supplier_code, supplier_name, contact, phone, address, credit_limit) VALUES
('S001', '北京食品供应商', '王经理', '13900139001', '北京市丰台区', 100000),
('S002', '上海日用品公司', '李总', '13900139002', '上海市浦东新区', 200000);

INSERT INTO customer (customer_code, customer_name, contact, phone, address, credit_limit) VALUES
('C001', '北京连锁超市', '张店长', '13700137001', '北京市朝阳区', 50000),
('C002', '天津贸易公司', '王经理', '13700137002', '天津市和平区', 80000);

INSERT INTO product (product_code, product_name, category_id, unit, purchase_price, sale_price, retail_price, min_stock, max_stock) VALUES
('P001', '矿泉水500ml', 1, '瓶', 1.50, 2.00, 2.50, 100, 2000),
('P002', '方便面', 1, '袋', 2.50, 3.50, 4.50, 50, 1000),
('P003', '洗衣液2L', 2, '瓶', 15.00, 20.00, 25.00, 20, 500),
('P004', 'A4打印纸500张', 3, '包', 18.00, 22.00, 25.00, 30, 300);
