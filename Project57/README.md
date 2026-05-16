# 电影票预订系统

基于 Node.js Express + Vue3 + Bootstrap + MongoDB 开发的简易电影票预订系统。

## 功能特性

### 用户端功能

- 🎬 电影列表浏览
- 📋 电影详情查看
- 🎟️ 场次选择
- 💺 座位选座（支持座位锁定）
- 📝 在线订票
- 🔍 订单查询
- 📊 票房统计

### 管理端功能

- 🎬 电影管理（增删改查）
- 📅 场次管理

## 技术栈

### 后端

- Node.js
- Express
- MongoDB + Mongoose
- CORS

### 前端

- Vue 3 (Composition API)
- Vue Router
- Axios
- Bootstrap 5
- Bootstrap Icons

### 基础设施

- Docker + Docker Compose

## 快速开始

### 环境要求

- Node.js 16+
- Docker 和 Docker Compose

### 安装步骤

1. 安装依赖

```bash
npm run install:all
```

2. 启动 MongoDB（需要 Docker）

```bash
npm run dev:db
```

3. 启动后端服务（终端 1）

```bash
npm run dev:backend
```

后端服务运行在 http://localhost:3000

4. 启动前端服务（终端 2）

```bash
npm run dev:frontend
```

前端服务运行在 http://localhost:5173

### 一键启动（推荐）

```bash
npm run dev
```

## 使用说明

### 1. 添加电影

- 访问 http://localhost:5173
- 点击导航栏「管理后台」→「电影管理」
- 添加电影信息

### 2. 添加场次

- 进入「管理后台」→「场次管理」
- 选择电影并添加场次信息

### 3. 订票流程

- 首页选择电影
- 选择场次
- 选择座位并提交订单

### 4. 查看订单

- 导航栏「订单查询」
- 可通过手机号或订单号查询

### 5. 票房统计

- 导航栏「票房统计」
- 查看总票房和各电影排行

## 核心功能说明

### 座位选座逻辑

- 座位状态：可选、已选、锁定、已售
- 用户选择座位后，提交订单时锁定座位防止重复购买
- 页面离开时自动解锁座位
- 锁定超时后自动释放

### 票房统计

- 按电影统计票房收入
- 统计总售票数和订单数
- 电影票房排行展示

## API 接口

### 电影相关

- `GET /api/movies` - 获取所有电影
- `GET /api/movies/:id` - 获取单个电影
- `POST /api/movies` - 添加电影
- `PUT /api/movies/:id` - 更新电影
- `DELETE /api/movies/:id` - 删除电影

### 场次相关

- `GET /api/schedules` - 获取所有场次
- `GET /api/schedules/:id` - 获取单个场次
- `POST /api/schedules` - 添加场次
- `PUT /api/schedules/:id` - 更新场次
- `DELETE /api/schedules/:id` - 删除场次

### 座位相关

- `GET /api/seats/schedule/:scheduleId` - 获取场次座位
- `POST /api/seats/lock` - 锁定座位
- `POST /api/seats/unlock` - 解锁座位

### 订单相关

- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取单个订单
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id/cancel` - 取消订单

### 统计相关

- `GET /api/stats/boxoffice` - 票房统计

## 项目结构

```
Project57/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── models/
│   │   ├── Movie.js
│   │   ├── Schedule.js
│   │   ├── Seat.js
│   │   └── Order.js
│   └── routes/
│       ├── movies.js
│       ├── schedules.js
│       ├── seats.js
│       ├── orders.js
│       └── stats.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.js
│       ├── App.vue
│       ├── router/
│       │   └── index.js
│       ├── api/
│       │   └── index.js
│       └── views/
│           ├── MovieList.vue
│           ├── MovieDetail.vue
│           ├── SeatSelection.vue
│           ├── OrderQuery.vue
│           ├── BoxOfficeStats.vue
│           └── admin/
│               ├── AdminMovies.vue
│               └── AdminSchedules.vue
├── docker compose.yml
├── package.json
└── README.md
```

## 许可证

MIT
