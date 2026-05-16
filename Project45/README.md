# 仓库出入库管理系统

基于 **Go Gin + Vue3 + Element Plus + MySQL** 技术栈构建的现代化仓库管理系统。

## 功能特性

### 核心功能

- **商品档案管理**：商品的增删改查，支持分类、SKU、价格、库存预警阈值配置
- **入库登记**：商品入库操作，自动增加库存，记录供应商、操作人等信息
- **出库登记**：商品出库操作，自动扣减库存，记录客户、操作人等信息
- **库存实时查询**：实时查看所有商品库存状态，支持低库存筛选
- **库存预警**：自动检测低库存商品，定时生成预警记录
- **出入库记录查询**：完整的出入库流水记录，支持多条件筛选

### 技术亮点

- **库存自动增减**：使用数据库事务保证库存操作的原子性
- **低库存定时提醒**：每5分钟自动扫描低库存商品，生成预警记录
- **出入库流水统计**：实时统计入库次数、出库次数、库存总量等

## 技术栈

### 后端

- **Go 1.21+**
- **Gin** - Web框架
- **GORM** - ORM框架
- **Viper** - 配置管理
- **Cron** - 定时任务
- **MySQL 8.0** - 数据库

### 前端

- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - UI组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP客户端
- **Vite** - 构建工具

### 部署

- **Docker** - 容器化部署
- **Docker Compose** - 服务编排

## 项目结构

```
Project45/
├── backend/                 # 后端代码
│   ├── config/             # 配置文件
│   │   ├── config.go       # 配置加载
│   │   └── config.yaml     # 配置文件
│   ├── controllers/        # 控制器
│   │   ├── alert.go        # 预警控制器
│   │   ├── inbound.go      # 入库控制器
│   │   ├── inventory.go    # 库存控制器
│   │   ├── outbound.go     # 出库控制器
│   │   └── product.go      # 商品控制器
│   ├── middleware/         # 中间件
│   │   └── cors.go         # CORS跨域
│   ├── models/             # 数据模型
│   │   └── models.go       # 数据库模型和连接
│   ├── routes/             # 路由
│   │   └── routes.go       # 路由配置
│   ├── utils/              # 工具函数
│   │   ├── response.go     # 响应封装
│   │   └── scheduler.go    # 定时任务
│   ├── Dockerfile          # Docker镜像
│   ├── go.mod              # Go依赖
│   └── main.go             # 入口文件
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── api/            # API接口
│   │   ├── router/         # 路由配置
│   │   ├── views/          # 页面组件
│   │   │   ├── Dashboard.vue    # 数据概览
│   │   │   ├── Products.vue     # 商品档案
│   │   │   ├── Inbound.vue      # 入库登记
│   │   │   ├── Outbound.vue     # 出库登记
│   │   │   ├── Inventory.vue    # 库存查询
│   │   │   ├── Alerts.vue       # 库存预警
│   │   │   ├── Records.vue      # 出入库记录
│   │   │   └── Layout.vue       # 布局组件
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 入口文件
│   ├── Dockerfile          # Docker镜像
│   ├── nginx.conf          # Nginx配置
│   ├── package.json        # Node依赖
│   └── vite.config.js      # Vite配置
├── docker/                 # Docker配置
│   ├── docker compose.yml  # MySQL容器
│   └── init.sql            # 初始化脚本
├── docker compose.yml      # 完整服务编排
├── start.sh                # Linux/Mac启动脚本
├── start.bat               # Windows启动脚本
└── README.md
```

## 快速开始

### 方式一：Docker一键启动（推荐）

**前置要求：**

- Docker
- Docker Compose

**启动命令：**

```bash
# 方式1：使用根目录docker compose
docker compose up -d --build

# 方式2：使用启动脚本（Linux/Mac）
./start.sh
# 选择 2) Docker模式

# 方式3：使用启动脚本（Windows）
start.bat
# 选择 1) Docker模式
```

**访问地址：**

- 前端：http://localhost
- 后端API：http://localhost:8080

**查看日志：**

```bash
docker compose logs -f
```

**停止服务：**

```bash
docker compose down
```

### 方式二：开发模式启动

**前置要求：**

- Go 1.21+
- Node.js 16+
- Docker（用于MySQL）

**启动步骤：**

**1. 启动MySQL**

```bash
cd docker
docker compose up -d mysql
```

**2. 启动后端**

```bash
cd backend
go mod tidy
go run main.go
```

**3. 启动前端**

```bash
cd frontend
npm install
npm run dev
```

**访问地址：**

- 前端：http://localhost:3000
- 后端API：http://localhost:8080

## API接口文档

### 商品管理

| 方法   | 路径                     | 说明             |
| ------ | ------------------------ | ---------------- |
| GET    | /api/products            | 获取商品列表     |
| GET    | /api/products/:id        | 获取商品详情     |
| POST   | /api/products            | 创建商品         |
| PUT    | /api/products/:id        | 更新商品         |
| DELETE | /api/products/:id        | 删除商品         |
| GET    | /api/products/categories | 获取商品分类列表 |

### 入库管理

| 方法   | 路径                    | 说明                     |
| ------ | ----------------------- | ------------------------ |
| GET    | /api/inbound            | 获取入库记录列表         |
| POST   | /api/inbound            | 创建入库记录             |
| DELETE | /api/inbound/:id        | 删除入库记录（回滚库存） |
| GET    | /api/inbound/statistics | 获取入库统计             |

### 出库管理

| 方法   | 路径                     | 说明                     |
| ------ | ------------------------ | ------------------------ |
| GET    | /api/outbound            | 获取出库记录列表         |
| POST   | /api/outbound            | 创建出库记录             |
| DELETE | /api/outbound/:id        | 删除出库记录（回滚库存） |
| GET    | /api/outbound/statistics | 获取出库统计             |

### 库存管理

| 方法 | 路径                        | 说明               |
| ---- | --------------------------- | ------------------ |
| GET  | /api/inventory              | 获取库存列表       |
| GET  | /api/inventory/statistics   | 获取库存统计       |
| GET  | /api/inventory/transactions | 获取出入库统计     |
| GET  | /api/inventory/records      | 获取全部出入库记录 |

### 预警管理

| 方法   | 路径                     | 说明             |
| ------ | ------------------------ | ---------------- |
| GET    | /api/alerts              | 获取预警列表     |
| GET    | /api/alerts/unread-count | 获取未读预警数量 |
| PUT    | /api/alerts/:id/read     | 标记单条为已读   |
| PUT    | /api/alerts/read-all     | 标记全部为已读   |
| DELETE | /api/alerts/:id          | 删除预警         |

## 数据库模型

### Product（商品表）

| 字段         | 类型    | 说明            |
| ------------ | ------- | --------------- |
| id           | uint    | 主键            |
| sku          | string  | 商品SKU（唯一） |
| name         | string  | 商品名称        |
| category     | string  | 分类            |
| unit         | string  | 单位            |
| price        | float64 | 单价            |
| stock        | int     | 当前库存        |
| min_stock    | int     | 最低库存预警值  |
| description  | string  | 描述            |
| is_low_stock | bool    | 是否低库存      |
| created_at   | time    | 创建时间        |
| updated_at   | time    | 更新时间        |

### InboundRecord（入库记录表）

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| id           | uint   | 主键     |
| product_id   | uint   | 商品ID   |
| product_sku  | string | 商品SKU  |
| product_name | string | 商品名称 |
| quantity     | int    | 入库数量 |
| supplier     | string | 供应商   |
| operator     | string | 操作人   |
| remark       | string | 备注     |
| created_at   | time   | 创建时间 |

### OutboundRecord（出库记录表）

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| id           | uint   | 主键     |
| product_id   | uint   | 商品ID   |
| product_sku  | string | 商品SKU  |
| product_name | string | 商品名称 |
| quantity     | int    | 出库数量 |
| customer     | string | 客户     |
| operator     | string | 操作人   |
| remark       | string | 备注     |
| created_at   | time   | 创建时间 |

### AlertRecord（预警记录表）

| 字段          | 类型   | 说明     |
| ------------- | ------ | -------- |
| id            | uint   | 主键     |
| product_id    | uint   | 商品ID   |
| product_sku   | string | 商品SKU  |
| product_name  | string | 商品名称 |
| current_stock | int    | 当前库存 |
| min_stock     | int    | 最低库存 |
| alert_message | string | 预警消息 |
| is_read       | bool   | 是否已读 |
| created_at    | time   | 创建时间 |

## 核心功能实现

### 库存自动增减

- 使用GORM事务保证数据一致性
- 入库时：创建入库记录 + 增加库存
- 出库时：校验库存是否充足 + 创建出库记录 + 扣减库存
- 删除记录时：回滚库存

### 低库存定时提醒

- 使用cron定时任务，每5分钟执行一次
- 扫描所有商品，检查库存是否低于最低库存阈值
- 首次检测到低库存时生成预警记录
- 库存恢复正常时自动解除预警状态

### 出入库流水统计

- 实时统计入库次数、入库总量
- 实时统计出库次数、出库总量
- 计算净库存变化

## 配置说明

### 后端配置 (backend/config/config.yaml)

```yaml
server:
  port: 8080

database:
  host: localhost
  port: 3306
  username: root
  password: 123456
  dbname: warehouse
  charset: utf8mb4

log:
  level: debug
```

### 数据库默认配置

- 主机：localhost
- 端口：3306
- 用户名：root
- 密码：123456
- 数据库：warehouse

## 常见问题

**Q: 启动后无法连接数据库？**

- 确保MySQL容器已启动：`docker ps`
- 检查端口3306是否被占用
- 确认配置文件中的数据库连接信息正确

**Q: 前端无法访问后端API？**

- 确保后端服务已启动，端口8080正常
- 开发模式下检查Vite代理配置
- Docker模式下检查Nginx配置

**Q: 定时任务不执行？**

- 检查系统时间是否正确
- 查看后端日志确认定时任务启动
- 手动触发：`curl http://localhost:8080/api/health`

## 许可证

MIT License
