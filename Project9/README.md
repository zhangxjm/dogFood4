# 图书馆管理系统

一个基于 Python FastAPI 异步框架 + React + Arco Design 开发的全栈图书馆管理系统。

## 技术栈

### 后端
- Python 3.11+
- FastAPI - 异步 Web 框架
- SQLAlchemy 2.0 - 异步 ORM
- PostgreSQL - 数据库
- asyncpg - 异步 PostgreSQL 驱动
- Pydantic - 数据验证

### 前端
- React 18+
- Arco Design - UI 组件库
- Axios - HTTP 客户端
- React Router - 路由管理

## 核心功能

- 📚 图书 ISBN 自动录入
- 🔍 馆藏检索（支持多种搜索方式）
- 📖 读者借阅/归还管理
- ⏰ 超期计费系统
- 📅 预约借书功能
- 📊 数据统计报表
- 📤 管理员批量导入导出
- 🔧 完整的图书 CRUD 操作

## 快速开始

### 使用 Docker（推荐）

1. 克隆项目后，在根目录运行：
```bash
docker-compose up -d --build
```

2. 访问：
- 后端 API: http://localhost:8000
- API 文档: http://localhost:8000/docs
- 前端应用: http://localhost:3000

### 手动启动

#### 后端

1. 进入后端目录：
```bash
cd backend
```

2. 安装依赖：
```bash
pip install -r requirements.txt
```

3. 启动 PostgreSQL（或使用 Docker）

4. 启动后端：
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动前端：
```bash
npm start
```

## 项目结构

```
.
├── backend/              # 后端 FastAPI 项目
│   ├── app/              # 应用代码
│   ├── requirements.txt  # Python 依赖
│   ├── Dockerfile        # Docker 配置
│   └── init.sql          # 数据库初始化
├── frontend/             # 前端 React 项目
│   ├── src/              # 源代码
│   ├── package.json      # 依赖配置
│   └── Dockerfile        # Docker 配置
└── docker-compose.yml    # 整体编排
```

## API 接口

### 图书管理
- `POST /api/books/isbn/{isbn}` - 通过 ISBN 自动录入图书
- `GET /api/books` - 获取图书列表（支持搜索和分页）
- `POST /api/books` - 创建图书
- `PUT /api/books/{id}` - 更新图书
- `DELETE /api/books/{id}` - 删除图书

### 借阅管理
- `POST /api/borrows` - 借阅图书
- `POST /api/borrows/{id}/return` - 归还图书
- `GET /api/borrows` - 获取借阅记录

### 预约管理
- `POST /api/reservations` - 预约借书
- `GET /api/reservations` - 获取预约记录

### 统计报表
- `GET /api/stats/overview` - 总体统计
- `GET /api/stats/borrows` - 借阅统计
- `GET /api/stats/overdue` - 超期统计

### 批量操作
- `POST /api/admin/import/books` - 批量导入图书
- `GET /api/admin/export/books` - 批量导出图书
