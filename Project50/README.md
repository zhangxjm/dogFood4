# 图书借阅管理系统

基于 Go Fiber + Vue3 + Element Plus + MySQL 的图书借阅管理系统

## 功能特性

- 📚 **图书管理**：图书的增删改查
- 👥 **读者管理**：读者信息管理，支持不同类型读者
- 📖 **借阅登记**：支持图书借阅，自动计算借阅期限
- 🔄 **归还登记**：图书归还，超期自动计算罚款
- 💰 **超期罚款**：按天计算罚款（0.5元/天）
- 📊 **借阅统计**：数据统计看板，包含借阅排行榜
- 🔒 **借阅限制**：支持读者最大借阅数量限制

## 技术栈

- **后端**：Go + Fiber + GORM
- **前端**：Vue3 + Element Plus + Axios
- **数据库**：MySQL 8.0
- **部署**：Docker + Docker Compose

## 快速启动

### 方式一：Docker Compose 启动（推荐）

```bash
# 进入项目目录
cd Project50

# 启动所有服务
docker-compose up -d

# 查看启动状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

启动后访问：
- 前端界面：http://localhost:3000
- 后端API：http://localhost:8080

### 方式二：本地开发启动

#### 后端

```bash
cd backend
go mod download
go run main.go
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

## 初始数据

系统预置以下测试数据：

### 图书
- 《深入理解计算机系统》- 计算机
- 《Go语言实战》- 计算机
- 《Vue.js设计与实现》- 计算机
- 《红楼梦》- 文学
- 《三体》- 科幻

### 读者
- 张三（教师，最多可借10本）
- 李四（学生，最多可借5本）
- 王五（普通读者，最多可借3本）

## API接口

### 图书
- `GET /api/books` - 获取图书列表
- `GET /api/books/:id` - 获取单个图书
- `POST /api/books` - 新增图书
- `PUT /api/books/:id` - 更新图书
- `DELETE /api/books/:id` - 删除图书

### 读者
- `GET /api/readers` - 获取读者列表
- `GET /api/readers/:id` - 获取单个读者
- `POST /api/readers` - 新增读者
- `PUT /api/readers/:id` - 更新读者
- `DELETE /api/readers/:id` - 删除读者

### 借阅
- `GET /api/borrows` - 获取借阅记录
- `POST /api/borrows` - 新增借阅
- `POST /api/borrows/return` - 归还图书
- `POST /api/borrows/:id/pay-fine` - 缴纳罚款

### 统计
- `GET /api/statistics` - 获取统计数据

## 项目结构

```
Project50/
├── docker-compose.yml      # Docker Compose配置
├── backend/               # 后端代码
│   ├── Dockerfile
│   ├── go.mod
│   ├── main.go           # 入口文件
│   ├── database/         # 数据库连接和初始化
│   ├── models/           # 数据模型
│   ├── controllers/      # 控制器
│   ├── routes/           # 路由配置
│   └── database/         # SQL初始化脚本
└── frontend/             # 前端代码
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue
        ├── router/       # 路由
        ├── views/        # 页面组件
        └── api/          # API封装
```

## 停止服务

```bash
# 停止服务
docker-compose down

# 停止服务并删除数据卷（谨慎使用）
docker-compose down -v
```
