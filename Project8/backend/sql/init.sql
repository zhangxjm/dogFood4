SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE TABLE IF NOT EXISTS `tables` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `table_no` VARCHAR(20) NOT NULL UNIQUE,
  `table_name` VARCHAR(50),
  `seats` INT DEFAULT 2,
  `qrcode` TEXT,
  `status` VARCHAR(20) DEFAULT 'AVAILABLE',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `dishes` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `category_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255),
  `price` DECIMAL(10,2) NOT NULL,
  `image` VARCHAR(500),
  `status` VARCHAR(20) DEFAULT 'ON_SALE',
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_no` VARCHAR(32) NOT NULL UNIQUE,
  `table_id` BIGINT NOT NULL,
  `customer_count` INT DEFAULT 1,
  `total_amount` DECIMAL(10,2) DEFAULT 0,
  `pay_amount` DECIMAL(10,2) DEFAULT 0,
  `status` VARCHAR(30) DEFAULT 'PENDING',
  `remark` VARCHAR(255),
  `kitchen_printed` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paid_at` DATETIME NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_table` (`table_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `order_id` BIGINT NOT NULL,
  `dish_id` BIGINT NOT NULL,
  `dish_name` VARCHAR(100) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `status` VARCHAR(30) DEFAULT 'PENDING',
  `remark` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  INDEX `idx_dish` (`dish_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `categories` (`name`, `sort_order`) VALUES 
('热销推荐', 1),
('主食', 2),
('小吃', 3),
('饮料', 4);

INSERT INTO `dishes` (`category_id`, `name`, `description`, `price`, `status`, `sort_order`) VALUES 
(1, '招牌牛肉面', '手工拉面，牛肉软烂', 28.00, 'ON_SALE', 1),
(1, '红烧排骨饭', '精选排骨，香糯米饭', 32.00, 'ON_SALE', 2),
(2, '蛋炒饭', '粒粒分明，香飘四溢', 15.00, 'ON_SALE', 1),
(2, '牛肉盖饭', '鲜嫩牛肉，入味十足', 25.00, 'ON_SALE', 2),
(2, '酸辣粉', '酸辣可口，劲道十足', 12.00, 'ON_SALE', 3),
(3, '炸鸡腿', '外酥里嫩，香辣可口', 10.00, 'ON_SALE', 1),
(3, '炸薯条', '金黄酥脆', 8.00, 'ON_SALE', 2),
(3, '凉拌黄瓜', '清爽解腻', 6.00, 'ON_SALE', 3),
(4, '可乐', '冰镇可乐', 5.00, 'ON_SALE', 1),
(4, '橙汁', '鲜榨橙汁', 8.00, 'ON_SALE', 2),
(4, '矿泉水', '怡宝矿泉水', 3.00, 'ON_SALE', 3);

INSERT INTO `tables` (`table_no`, `table_name`, `seats`, `status`) VALUES 
('A01', '1号桌', 2, 'AVAILABLE'),
('A02', '2号桌', 2, 'AVAILABLE'),
('A03', '3号桌', 4, 'AVAILABLE'),
('A04', '4号桌', 4, 'AVAILABLE'),
('B01', '5号桌', 6, 'AVAILABLE'),
('B02', '6号桌', 6, 'AVAILABLE');
