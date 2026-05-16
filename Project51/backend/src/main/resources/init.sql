CREATE DATABASE IF NOT EXISTS hospital_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_db;

INSERT INTO department (name, description, sort_order, status, create_time, update_time) VALUES
('内科', '内科诊疗中心', 1, 1, NOW(), NOW()),
('外科', '外科诊疗中心', 2, 1, NOW(), NOW()),
('儿科', '儿科诊疗中心', 3, 1, NOW(), NOW()),
('妇产科', '妇产科诊疗中心', 4, 1, NOW(), NOW()),
('骨科', '骨科诊疗中心', 5, 1, NOW(), NOW());

INSERT INTO doctor (name, department_id, title, specialty, status, create_time, update_time) VALUES
('张医生', 1, '主任医师', '擅长心血管疾病、呼吸系统疾病诊治', 1, NOW(), NOW()),
('李医生', 1, '副主任医师', '擅长消化系统疾病、内分泌疾病诊治', 1, NOW(), NOW()),
('王医生', 2, '主任医师', '擅长普外科手术、腹腔镜手术', 1, NOW(), NOW()),
('赵医生', 2, '主治医师', '擅长微创手术、创伤外科', 1, NOW(), NOW()),
('刘医生', 3, '副主任医师', '擅长小儿呼吸系统、消化系统疾病', 1, NOW(), NOW());
