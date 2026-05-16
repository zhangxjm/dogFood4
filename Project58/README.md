# 办公用品管理系统

基于 Go Beego + Vue3 + Element Plus + MySQL 构建的办公用品申领系统

## 功能特性

- 用户认证（JWT）
- 办公用品分类管理
- 办公用品库存管理
- 员工申领管理
- 两级审批流程（经理 -> 管理员）
- 申领记录查询
- 库存出入库记录
- 数据统计看板

## 技术栈

### 后端
- Go 1.21
- Beego v2.2.0
- GORM v1.25.4
- MySQL 8.0
- JWT认证

### 前端
- Vue 3
- Element Plus
- Vue Router
- Pinia
- Axios
- Vite

## 快速开始

### 1. 启动数据库服务

```bash
docker-compose up -d
```

### 2. 启动后端服务

```bash
cd backend
go mod download
go run main.go
```

后端服务将在 http://localhost:3001 启动

### 3. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | 123456 | 管理员 | 拥有所有权限 |
| manager | 123456 | 经理 | 一级审批权限 |
| employee | 123456 | 员工 | 只能申领 |

## 项目结构

```
Project58/
├── backend/
│   ├── main.go           # 入口文件
│   ├── models/           # 数据模型
│   ├── controllers/      # 控制器
│   ├── utils/            # 工具函数
│   └── go.mod            # 依赖配置
├── frontend/
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── store/        # Pinia状态
│   │   ├── router/       # 路由配置
│   │   ├── utils/        # 工具函数
│   │   ├── App.vue       # 根组件
│   │   └── main.js       # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml     # Docker配置
└── README.md
```

## API接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /auth/login | 登录 | 公开 |
| GET | /auth/userinfo | 获取用户信息 | 已认证 |
| GET | /categories | 分类列表 | 已认证 |
| POST | /categories | 创建分类 | 管理员 |
| PUT | /categories/:id | 更新分类 | 管理员 |
| DELETE | /categories/:id | 删除分类 | 管理员 |
| GET | /supplies | 物品列表 | 已认证 |
| POST | /supplies | 创建物品 | 经理/管理员 |
| PUT | /supplies/:id | 更新物品 | 经理/管理员 |
| DELETE | /supplies/:id | 删除物品 | 经理/管理员 |
| POST | /supplies/:id/stock-in | 入库 | 经理/管理员 |
| GET | /applications | 我的申领列表 | 已认证 |
| POST | /applications | 创建申领 | 已认证 |
| GET | /applications/pending | 待审批列表 | 经理/管理员 |
| GET | /applications/:id | 申领详情 | 已认证 |
| DELETE | /applications/:id | 删除申领 | 申请人 |
| POST | /applications/:id/approve | 审批通过 | 经理/管理员 |
| POST | /applications/:id/reject | 驳回 | 经理/管理员 |
| POST | /applications/:id/receive | 确认收货 | 申请人 |
| GET | /stock-records | 库存记录 | 经理/管理员 |
| GET | /stats/dashboard | 看板统计 | 已认证 |

## 审批流程

1. 员工创建申领单（状态：待审批）
2. 经理审批（状态：一级通过）
3. 管理员审批（状态：二级通过，库存自动扣减）
4. 员工确认收货（状态：已收货）

注意：管理员可以直接跳过一级审批，直接二级审批通过
