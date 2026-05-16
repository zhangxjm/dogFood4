# 奶茶店收银系统

基于 Java SpringBoot + Vue3 + Vant + SQLite 开发的奶茶店收银系统。

## 功能特性

- ✅ 商品点单 - 支持奶茶、果茶、奶盖、咖啡等分类
- ✅ 规格选择 - 糖度（无糖/少糖/半糖/正常糖）、冰量（去冰/少冰/正常冰/热饮）
- ✅ 购物车管理 - Pinia 状态管理，支持增减数量、删除商品
- ✅ 收银结算 - 支持现金、微信、支付宝三种支付方式
- ✅ 小票打印 - 订单完成后可打印小票
- ✅ 日结统计 - 按日期查询订单统计和明细

## 技术栈

### 后端
- Java 11
- Spring Boot 2.7.18
- Spring Data JPA
- SQLite 数据库

### 前端
- Vue 3
- Vite
- Pinia (状态管理)
- Vue Router
- Vant UI (移动端组件库)
- Axios

## 快速开始

### 环境要求
- JDK 11+
- Node.js 16+
- Maven 3.6+

### 一键启动

```bash
chmod +x start.sh
./start.sh
```

### 手动启动

#### 启动后端服务
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
后端服务运行在 http://localhost:8080

#### 启动前端服务
```bash
cd frontend
npm install
npm run dev
```
前端服务运行在 http://localhost:3000

## API 接口

### 商品接口
- `GET /api/products` - 获取所有商品
- `GET /api/products/category/{category}` - 按分类获取商品
- `GET /api/products/{id}` - 获取单个商品

### 订单接口
- `POST /api/orders` - 创建订单
- `GET /api/orders/{orderNo}` - 查询订单

### 报表接口
- `GET /api/reports/daily?date=2024-01-15` - 获取日结报表

## 项目结构

```
Project48/
├── backend/                    # 后端项目
│   ├── src/
│   │   └── main/
│   │       ├── java/com/milktea/pos/
│   │       │   ├── entity/    # 实体类
│   │       │   ├── repository/# 数据访问层
│   │       │   ├── service/   # 业务逻辑层
│   │       │   ├── controller/# 控制器
│   │       │   └── dto/       # 数据传输对象
│   │       └── resources/
│   └── pom.xml
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── views/             # 页面组件
│   │   ├── stores/            # Pinia 状态
│   │   ├── router/            # 路由配置
│   │   └── api/               # API 封装
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── start.sh                   # 启动脚本
```

## 预置商品数据

系统启动时会自动创建以下商品：

- **奶茶类**: 珍珠奶茶、波霸奶茶、芋泥奶茶、红豆奶茶、布丁奶茶、椰果奶茶
- **果茶类**: 满杯水果茶、柠檬绿茶、百香果果茶、芒果多多
- **奶盖类**: 芝士奶盖、奥利奥奶盖
- **咖啡类**: 抹茶拿铁、焦糖玛奇朵、美式咖啡

## 数据库

使用 SQLite 嵌入式数据库，数据库文件为 `milktea_pos.db`，自动建表和初始化数据。

## 功能演示

1. **点单**: 选择商品分类，点击商品选择糖度和冰量，加入购物车
2. **结算**: 点击购物车结算，选择支付方式，确认支付
3. **打印小票**: 支付成功后可打印订单小票
4. **日结报表**: 点击首页右上角"日结报表"，查看每日订单统计和明细

## 注意事项

- 支付功能为模拟支付，实际项目需要对接真实支付接口
- 打印功能使用浏览器的打印功能，可连接小票打印机
- SQLite 适合小型应用，大型应用建议更换为 MySQL 或 PostgreSQL
