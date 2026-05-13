# 工地出勤管理系统

## 项目简介
基于 Gin + MySQL 的工地简易人员出勤管理系统，支持工人信息登记、每日上下班签到、出勤记录查询。

## 功能特性
- 👷 工人信息管理（增删改查）
- ✅ 上班签到
- 🏁 下班签退
- 📊 出勤记录查询（支持日期范围、工人、状态筛选）
- 手动录入签到记录，无定位、无人脸识别

## 技术栈
- **后端**: Go + Gin
- **数据库**: MySQL 8.0
- **前端**: 原生 HTML + CSS
- **ORM**: GORM
- **容器**: Docker

## 快速开始

### 1. 启动 MySQL 数据库
```bash
docker-compose up -d
```

### 2. 下载依赖
```bash
go mod tidy
```

### 3. 运行项目
```bash
go run main.go
```

### 4. 访问系统
打开浏览器访问: http://localhost:8080

## 数据库配置
- 数据库名: attendance
- 用户名: attendance
- 密码: attendance123
- 端口: 3306

## 目录结构
```
.
├── main.go              # 主程序入口
├── docker-compose.yml   # Docker 配置
├── go.mod               # Go 模块配置
├── handlers/            # 处理器
│   ├── workers.go       # 工人管理
│   └── attendance.go    # 出勤管理
├── models/              # 数据模型
│   ├── models.go        # 数据结构定义
│   └── db.go            # 数据库连接
├── templates/           # HTML 模板
│   ├── base.html        # 基础布局
│   ├── index.html       # 首页
│   ├── workers.html     # 工人列表
│   ├── worker_form.html # 工人表单
│   ├── attendance.html  # 签到页面
│   ├── records.html     # 记录查询
│   └── attendance_edit.html # 编辑记录
└── static/              # 静态文件
    └── css/
        └── style.css    # 样式文件
```

## 使用说明

### 1. 添加工人
1. 点击导航栏的「工人管理」
2. 点击「添加工人」按钮
3. 填写工人信息并保存

### 2. 签到签退
1. 点击导航栏的「签到签退」
2. 选择工人和日期
3. 填写签到/签退时间
4. 点击签到或签退按钮

### 3. 查看记录
1. 点击导航栏的「出勤记录」
2. 可按日期范围、工人、状态筛选
3. 支持编辑和删除记录

## 状态说明
- 正常: 正常出勤
- 迟到: 签到迟到
- 早退: 签退早退
- 加班: 加班出勤
- 请假: 请假
- 旷工: 未出勤
