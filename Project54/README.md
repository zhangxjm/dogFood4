# 宠物寄养预约系统

基于 Go Gin + Vue3 + MySQL 构建的全栈宠物寄养预约管理系统。

## 功能特性

- 📦 **寄养套餐管理**: 创建、编辑、删除寄养套餐
- 🐾 **宠物信息管理**: 管理宠物和主人信息
- 📅 **在线预约**: 创建预约，自动计算价格，时间冲突检测
- 🔄 **状态更新**: 预约状态流转（待确认→已确认→寄养中→已完成→已取消）
- ⭐ **服务评价**: 对完成的寄养服务进行评分和评价
- 📊 **订单统计**: 数据统计面板，显示预约数量、收入、评分等

## 技术栈

### 后端
- Go 1.21
- Gin Web Framework
- GORM ORM
- MySQL 8.0

### 前端
- Vue 3 (Composition API)
- Vue Router 4
- Element Plus
- Axios
- Vite

## 快速启动

### 使用 Docker Compose (推荐)

```bash
# 进入项目目录
cd Project54

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

启动后访问：
- 前端: http://localhost:3000
- 后端API: http://localhost:8080

### 手动启动

#### 后端

```bash
cd backend

# 安装依赖
go mod download

# 设置环境变量
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=pet_user
export DB_PASSWORD=pet123456
export DB_NAME=pet_foster

# 启动服务
go run main.go
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## API 接口

### 套餐管理
- `GET /api/packages` - 获取所有套餐
- `GET /api/packages/:id` - 获取单个套餐
- `POST /api/packages` - 创建套餐
- `PUT /api/packages/:id` - 更新套餐
- `DELETE /api/packages/:id` - 删除套餐

### 宠物管理
- `GET /api/pets` - 获取所有宠物
- `GET /api/pets/:id` - 获取单个宠物
- `POST /api/pets` - 创建宠物
- `PUT /api/pets/:id` - 更新宠物
- `DELETE /api/pets/:id` - 删除宠物

### 预约管理
- `GET /api/reservations` - 获取所有预约
- `GET /api/reservations/:id` - 获取单个预约
- `POST /api/reservations` - 创建预约
- `PUT /api/reservations/:id` - 更新预约
- `PUT /api/reservations/:id/status` - 更新预约状态
- `DELETE /api/reservations/:id` - 删除预约
- `POST /api/reservations/check-availability` - 检查时间可用性

### 评价管理
- `GET /api/reviews` - 获取所有评价
- `GET /api/reviews/:id` - 获取单个评价
- `POST /api/reviews` - 创建评价
- `PUT /api/reviews/:id` - 更新评价
- `DELETE /api/reviews/:id` - 删除评价

### 统计
- `GET /api/statistics` - 获取统计数据

## 项目结构

```
Project54/
├── backend/
│   ├── main.go
│   ├── go.mod
│   ├── config/
│   │   └── database.go
│   ├── models/
│   │   └── models.go
│   ├── controllers/
│   │   ├── package.go
│   │   ├── pet.go
│   │   ├── reservation.go
│   │   ├── review.go
│   │   └── statistics.go
│   ├── routes/
│   │   └── routes.go
│   └── sql/
│       └── init.sql
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
│           ├── Dashboard.vue
│           ├── Packages.vue
│           ├── Pets.vue
│           ├── Reservations.vue
│           └── Reviews.vue
├── docker-compose.yml
└── README.md
```

## 数据库初始化

系统会自动创建以下表并插入初始套餐数据：
- packages: 寄养套餐表
- pets: 宠物信息表
- reservations: 预约表
- reviews: 评价表

## 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v
```
