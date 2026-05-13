# 校园二手闲置交易平台

基于 Python FastAPI + React + Vant 的校园二手闲置交易全栈项目。

## 技术栈

### 后端
- FastAPI - 高性能异步 Web 框架
- SQLAlchemy 2.0 - ORM 框架
- SQLite - 轻量级数据库
- WebSocket - 实时聊天
- Pydantic - 数据验证

### 前端
- React 18
- Vant UI - 移动端组件库
- Vite - 构建工具
- React Router - 路由
- Axios - HTTP 客户端

## 项目结构

```
Project5/
├── backend/          # 后端 FastAPI 项目
│   ├── app/
│   │   ├── api/          # API 路由
│   │   ├── core/         # 核心配置
│   │   ├── models/       # 数据模型
│   │   ├── schemas/      # Pydantic 模型
│   │   ├── services/     # 业务逻辑
│   │   ├── websockets/   # WebSocket 聊天
│   │   └── database.py   # 数据库连接
│   ├── requirements.txt
│   └── main.py
├── frontend/         # 前端 React 项目
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── services/     # API 服务
│   │   ├── utils/        # 工具函数
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## 核心功能

- ✅ 用户注册/登录
- ✅ 学生实名认证
- ✅ 闲置商品发布
- ✅ 商品搜索/筛选
- ✅ 商品收藏
- ✅ 实时在线聊天 (WebSocket)
- ✅ 订单担保交易
- ✅ 校园自提约定
- ✅ 用户中心

## 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看状态
docker-compose ps
```

- 后端: http://localhost:8000
- API 文档: http://localhost:8000/docs
- 前端: http://localhost:5173

### 方式二：本地开发

#### 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | 123456 | 管理员 |
| student1 | 123456 | 学生 |
| student2 | 123456 | 学生 |

## API 接口

### 用户相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/verify` - 学生实名认证

### 商品相关
- `GET /api/products` - 获取商品列表
- `POST /api/products` - 发布商品
- `GET /api/products/{id}` - 商品详情
- `POST /api/products/{id}/favorite` - 收藏商品

### 订单相关
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 订单列表
- `POST /api/orders/{id}/confirm` - 确认收货

### 聊天相关
- `WebSocket /ws/chat/{conversation_id}` - 实时聊天
- `GET /api/chat/conversations` - 会话列表
- `GET /api/chat/conversations/{id}/messages` - 消息记录
