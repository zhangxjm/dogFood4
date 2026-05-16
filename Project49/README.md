# 健身房会员管理系统

基于 Node.js Koa + Vue3 + SQLite 开发的健身房会员管理系统。

## ✨ 核心功能

- **会员管理**: 会员注册、信息编辑、查询
- **会员卡管理**: 多种卡类型支持（时间卡/次卡）、办卡、充值续费
- **课时自动扣减**: 预约完成时自动扣减课时
- **私教预约**: 教练管理、时间冲突检测、预约状态流转
- **消费记录**: 所有交易流水记录与统计分析
- **到期提醒**: 会员卡到期自动提醒（定时任务）

## 🛠 技术栈

- **后端**: Node.js + Koa + sql.js (纯JavaScript SQLite)
- **前端**: Vue3 + Vite + Vue Router + Axios
- **定时任务**: node-schedule

## 🚀 快速启动

### 方式一：使用启动脚本（推荐）

```bash
# 1. 启动后端服务 (端口 3001)
./start-backend.sh

# 2. 新开终端启动前端服务 (端口 5173)
./start-frontend.sh
```

### 方式二：手动启动

```bash
# 1. 启动后端服务
cd backend
npm install
npm start

# 2. 新开终端启动前端服务
cd ../frontend
npm install
npm run dev
```

## 🌐 服务地址

- 后端API: http://localhost:3001
- 前端页面: http://localhost:5173

## 📋 API接口说明

### 会员卡类型
- `GET /api/card-types` - 获取所有卡类型
- `POST /api/card-types` - 添加卡类型
- `PUT /api/card-types/:id` - 更新卡类型
- `DELETE /api/card-types/:id` - 删除卡类型

### 会员管理
- `GET /api/members` - 获取所有会员
- `GET /api/members/:id` - 获取会员详情
- `POST /api/members` - 添加会员
- `POST /api/members/:id/buy-card` - 会员办卡
- `POST /api/members/:id/recharge` - 会员卡充值

### 教练管理
- `GET /api/trainers` - 获取所有教练
- `POST /api/trainers` - 添加教练
- `PUT /api/trainers/:id` - 更新教练
- `DELETE /api/trainers/:id` - 删除教练

### 预约管理
- `GET /api/appointments` - 获取所有预约
- `POST /api/appointments` - 添加预约
- `PUT /api/appointments/:id/confirm` - 确认预约
- `PUT /api/appointments/:id/complete` - 完成预约（扣课时）
- `PUT /api/appointments/:id/cancel` - 取消预约

### 消费记录
- `GET /api/transactions` - 获取消费记录
- `GET /api/transactions/stats` - 获取统计数据

### 提醒管理
- `GET /api/reminders` - 获取提醒列表
- `GET /api/reminders/expiring-members` - 获取即将到期会员
- `PUT /api/reminders/:id/read` - 标记已读

## 📦 预设数据

系统初始化时会自动创建：

### 会员卡类型
- 月卡 - ¥299（30天不限次）
- 季卡 - ¥799（90天不限次）
- 年卡 - ¥2999（365天不限次）
- 10次卡 - ¥500（180天，10次）
- 30次卡 - ¥1200（365天，30次）
- 私教10次卡 - ¥3000（180天，10次私教）

### 教练
- 王教练（增肌、力量训练）
- 李教练（减脂、有氧训练）
- 张教练（瑜伽、普拉提）

## ⏰ 定时任务

系统会自动执行以下定时任务：

1. **每天 9:00** - 检查即将到期的会员卡（7天内到期），自动创建提醒
2. **每小时** - 检查已结束的预约，自动完成并扣减课时

## 📁 项目结构

```
Project49/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── app.js         # 入口文件
│   │   ├── database/      # 数据库相关
│   │   │   ├── db.js     # 数据库连接
│   │   │   └── init.js   # 数据库初始化
│   │   ├── routes/        # API路由
│   │   │   ├── cardTypes.js
│   │   │   ├── members.js
│   │   │   ├── trainers.js
│   │   │   ├── appointments.js
│   │   │   ├── transactions.js
│   │   │   └── reminders.js
│   │   └── scheduler/     # 定时任务
│   │       └── index.js
│   ├── data/              # 数据库文件目录
│   └── package.json
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   │   ├── Home.vue
│   │   │   ├── Members.vue
│   │   │   ├── MemberDetail.vue
│   │   │   ├── Appointments.vue
│   │   │   ├── Transactions.vue
│   │   │   └── Reminders.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   └── api.js    # API封装
│   │   ├── assets/
│   │   │   └── style.css
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── start-backend.sh       # 后端启动脚本
├── start-frontend.sh      # 前端启动脚本
├── docker-compose.yml     # Docker配置
└── README.md
```

## 🎯 核心难点解决方案

### 1. 会员卡类型管理
- 支持时间卡（月卡/季卡/年卡）和次卡（课时卡）
- 每种卡类型可独立配置价格、有效期、课时数
- 办卡时自动计算有效期，充值时自动累加

### 2. 课时自动扣减
- 手动完成预约时即时扣减
- 每小时定时任务自动扫描已过期预约并扣减
- 所有扣减记录同步到消费流水，支持追溯

### 3. 到期定时提醒
- 每天9:00自动扫描7天内即将到期的会员卡
- 为每个到期会员创建提醒记录
- 支持在前端查看和标记已读

## 🐳 Docker部署

```bash
# 构建并启动服务
npm run docker:up

# 停止服务
npm run docker:down
```