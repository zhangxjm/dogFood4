CREATE DATABASE IF NOT EXISTS supermarket DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE supermarket;

CREATE USER IF NOT EXISTS 'supermarket'@'%' IDENTIFIED BY 'supermarket123';
GRANT ALL PRIVILEGES ON supermarket.* TO 'supermarket'@'%';
FLUSH PRIVILEGES;
