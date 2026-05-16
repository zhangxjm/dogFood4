# 二手交易平台

基于Java SpringBoot + Vue3 + Vant + SQLite开发的简易二手交易平台

## 功能特性

- 用户注册/登录
- 商品发布（支持多图上传）
- 商品搜索（按关键词和分类）
- 收藏功能
- 卖家中心
- 交易记录

## 技术栈

### 后端
- Java 11
- Spring Boot 2.7.x
- Spring Data JPA
- SQLite 数据库

### 前端
- Vue 3
- Vant 4.x (移动端UI组件库)
- Vue Router
- Axios

## 快速开始

### 方式一：使用启动脚本（推荐）

```bash
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

#### 启动后端
```bash
cd backend
mvn clean package -DskipTests
java -jar target/*.jar
```

#### 启动前端
```bash
cd frontend
npm install --registry=https://registry.npmmirror.com
npm run dev
```

### 方式三：Docker启动

> ⚠️ 注意：国内网络环境可能遇到Docker镜像拉取问题，如遇403 Forbidden错误，建议使用方式一或方式二本地启动

```bash
docker-compose up -d
```

## 访问地址

- 前端: http://localhost:3000
- 后端: http://localhost:8080

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/secondhand/
│   │       │   ├── entity/        # 实体类
│   │       │   ├── repository/    # 数据访问层
│   │       │   ├── service/       # 业务逻辑层
│   │       │   └── controller/    # 控制层
│   │       └── resources/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── views/           # 页面组件
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── api.js
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── docker-compose.yml
├── start.sh
└── README.md
```

## API接口

### 用户模块
- POST /api/users/register - 用户注册
- POST /api/users/login - 用户登录
- GET /api/users/{id} - 获取用户信息
- PUT /api/users/{id} - 更新用户信息

### 商品模块
- POST /api/products/upload - 上传图片
- POST /api/products - 发布商品
- GET /api/products/{id} - 获取商品详情
- GET /api/products - 获取商品列表（支持关键词和分类筛选）
- PUT /api/products/{id}/status - 更新商品状态

### 收藏模块
- POST /api/favorites - 添加收藏
- DELETE /api/favorites - 取消收藏
- GET /api/favorites/check - 检查是否已收藏
- GET /api/favorites/user/{userId} - 获取用户收藏列表

### 交易模块
- POST /api/transactions - 创建交易
- GET /api/transactions/{id} - 获取交易详情
- GET /api/transactions/buyer/{buyerId} - 获取买家交易记录
- GET /api/transactions/seller/{sellerId} - 获取卖家交易记录
- PUT /api/transactions/{id}/status - 更新交易状态

## 开发说明

### 数据库
项目使用SQLite嵌入式数据库，首次启动时会自动创建数据库和表结构，数据库文件为`secondhand.db`。

### 图片上传
上传的图片存储在`uploads`目录下，通过`/uploads/**`路径访问。

### 商品状态
- ON_SALE: 在售
- SOLD: 已售出

### 交易状态
- PENDING: 交易中
- COMPLETED: 已完成
