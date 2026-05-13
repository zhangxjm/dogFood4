# 宿舍管理系统

基于 Gin + Vue3 + SQLite 的宿舍管理全栈单体项目。

## 功能模块

- **宿舍信息管理**：宿舍增删改查，查看住户
- **住宿名单管理**：住户增删改查，CSV导出
- **水电费管理**：按月录入，状态标记，费用统计

## 技术栈

- 后端：Gin (Go) + GORM + SQLite
- 前端：Vue3 + Element Plus + Axios
- 容器化：Docker + Docker Compose

## 项目结构

```
.
├── backend/           # Go 后端
│   ├── config/        # 数据库配置
│   ├── controllers/   # 控制器
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── utils/         # 工具函数
│   ├── Dockerfile
│   ├── go.mod
│   └── main.go
├── frontend/          # Vue3 前端
│   ├── src/
│   │   ├── api/       # API 封装
│   │   ├── router/    # 路由
│   │   ├── views/     # 页面组件
│   │   ├── App.vue
│   │   └── main.js
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

## 启动方式

### 方式一：Docker Compose (推荐)

```bash
docker compose up --build
```

- 前端访问: http://localhost:3000
- 后端API: http://localhost:8080

### 方式二：本地开发模式

**前置条件**: 已安装 Go 1.21+ 和 Node.js 18+

**启动后端**:
```bash
cd backend
go mod tidy
go run main.go
```

**启动前端**:
```bash
cd frontend
npm install
npm run dev
```

- 前端访问: http://localhost:3000
- 后端API: http://localhost:8080

## API 接口

### 宿舍管理
- `GET    /api/rooms`          - 获取宿舍列表
- `POST   /api/rooms`          - 新增宿舍
- `PUT    /api/rooms/:id`      - 更新宿舍
- `DELETE /api/rooms/:id`      - 删除宿舍
- `GET    /api/rooms/:id/residents` - 查看宿舍住户

### 住宿管理
- `GET    /api/residents`      - 获取住宿名单
- `POST   /api/residents`      - 新增住宿
- `PUT    /api/residents/:id`  - 更新住宿
- `DELETE /api/residents/:id`  - 删除住宿
- `GET    /api/residents/export/csv` - 导出CSV

### 水电费管理
- `GET    /api/utilities`      - 获取费用列表 (支持?month=&room_id=)
- `POST   /api/utilities`      - 录入费用
- `PUT    /api/utilities/:id`  - 更新费用
- `DELETE /api/utilities/:id`  - 删除费用
- `GET    /api/utilities/stats` - 获取统计数据
