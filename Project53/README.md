# 企业员工考勤系统

基于 Node.js NestJS + Vue3 + Element Plus + MongoDB 开发的企业员工考勤管理系统。

## 功能特性

### 核心功能
- **上下班打卡**：支持上班签到、下班签退，自动记录打卡时间
- **请假申请**：支持年假、病假、事假、婚假、产假等多种请假类型
- **加班登记**：支持工作日、周末、节假日加班登记
- **考勤统计**：月度考勤统计，包含正常出勤、迟到、早退、缺勤等数据
- **月度考勤报表**：支持导出 Excel 格式的考勤报表
- **异常考勤处理**：处理迟到、早退等异常考勤记录

### 技术难点
- **打卡时间校验**：自动判断是否迟到、早退
- **考勤自动计算**：自动计算工作时长和考勤状态
- **Excel 报表导出**：使用 exceljs 库生成专业的 Excel 报表

## 技术栈

### 后端
- **框架**：NestJS
- **数据库**：MongoDB
- **ORM**：Mongoose
- **其他**：dayjs（日期处理）、exceljs（Excel导出）

### 前端
- **框架**：Vue 3
- **UI组件库**：Element Plus
- **路由**：Vue Router
- **HTTP客户端**：Axios
- **日期处理**：dayjs

### 部署
- Docker & Docker Compose

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

#### 1. 启动 MongoDB
```bash
docker run -d --name attendance-mongodb -p 27017:27017 mongo:5.0
```

#### 2. 启动后端服务
```bash
cd backend
npm install
npm run build
npm run start:prod
```

#### 3. 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

### 方式三：使用 Docker Compose

```bash
docker-compose up -d
```

## 访问地址

- **前端页面**：http://localhost:5173
- **后端API**：http://localhost:3000

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   │   ├── user/       # 用户模块
│   │   │   ├── attendance/ # 考勤模块
│   │   │   ├── leave/      # 请假模块
│   │   │   ├── overtime/   # 加班模块
│   │   │   └── statistics/ # 统计模块
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── router/        # 路由配置
│   │   └── main.js
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── start.sh
└── README.md
```

## API 接口

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `GET /api/users/:id` - 获取用户详情
- `PATCH /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 考勤管理
- `POST /api/attendance/check-in` - 上班签到
- `POST /api/attendance/check-out` - 下班签退
- `GET /api/attendance` - 获取考勤记录
- `GET /api/attendance/today/:userId` - 获取今日考勤
- `GET /api/attendance/monthly/:userId` - 获取月度考勤
- `PATCH /api/attendance/:id` - 更新考勤记录

### 请假管理
- `GET /api/leave` - 获取请假列表
- `POST /api/leave` - 申请请假
- `PATCH /api/leave/:id/approve` - 审批请假
- `DELETE /api/leave/:id` - 删除请假申请

### 加班管理
- `GET /api/overtime` - 获取加班列表
- `POST /api/overtime` - 登记加班
- `PATCH /api/overtime/:id/approve` - 审批加班
- `DELETE /api/overtime/:id` - 删除加班登记

### 统计报表
- `GET /api/statistics/monthly/:userId` - 获取月度统计
- `GET /api/statistics/exceptions` - 获取异常考勤列表
- `GET /api/statistics/export/:userId` - 导出 Excel 报表

## 考勤规则

- **上班时间**：09:00
- **下班时间**：18:00
- **迟到判定**：超过 09:30 记为迟到
- **早退判定**：早于 17:30 记为早退

## License

MIT
