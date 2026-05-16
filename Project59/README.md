# CRM客户关系管理系统

这是一个基于Java SpringBoot + React + Ant Design + SQLite开发的简易CRM系统。

## 功能特性

- **客户信息管理**: 客户增删改查，客户状态、来源、级别管理
- **跟进记录**: 跟进记录管理，支持多种跟进类型
- **销售机会**: 销售机会追踪，阶段管理，成功率预估
- **合同管理**: 合同信息管理，自动生成合同编号
- **统计分析**: 销售漏斗统计，客户来源统计，仪表盘概览
- **跟进提醒**: 自动提醒近期需要跟进的客户

## 技术栈

### 后端
- Java 17
- SpringBoot 3.2
- Spring Data JPA
- SQLite 数据库
- Lombok

### 前端
- React 18
- Ant Design 5
- React Router 6
- Axios
- Vite

## 快速启动

### 方式一：Docker Compose 启动（推荐）

```bash
# 克隆项目后进入目录
cd Project59

# 启动所有服务
docker-compose up -d

# 访问前端: http://localhost:3000
# 访问后端API: http://localhost:8080
```

### 方式二：本地开发启动

#### 启动后端

```bash
cd crm-backend

# 使用Maven构建并运行
mvn spring-boot:run

# 或打包后运行
mvn package
java -jar target/crm-backend-1.0.0.jar
```

后端服务将在 http://localhost:8080 启动

#### 启动前端

```bash
cd crm-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 http://localhost:3000 启动

## 项目结构

```
Project59/
├── crm-backend/                 # 后端项目
│   ├── src/main/java/com/crm/
│   │   ├── entity/             # 实体类
│   │   ├── repository/         # 数据访问层
│   │   ├── service/            # 业务逻辑层
│   │   ├── controller/         # 控制器层
│   │   └── config/             # 配置类
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── crm-frontend/                # 前端项目
│   ├── src/
│   │   ├── components/         # 公共组件
│   │   ├── pages/              # 页面组件
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── docker-compose.yml           # Docker编排配置
```

## API接口

### 客户管理
- `GET /api/customers` - 获取所有客户
- `GET /api/customers/{id}` - 获取单个客户
- `POST /api/customers` - 创建客户
- `PUT /api/customers/{id}` - 更新客户
- `DELETE /api/customers/{id}` - 删除客户
- `GET /api/customers/upcoming-followups` - 获取即将跟进的客户

### 跟进记录
- `GET /api/followups` - 获取所有跟进记录
- `GET /api/followups/{id}` - 获取单个跟进记录
- `GET /api/followups/customer/{customerId}` - 获取客户的跟进记录
- `POST /api/followups` - 创建跟进记录
- `PUT /api/followups/{id}` - 更新跟进记录
- `DELETE /api/followups/{id}` - 删除跟进记录

### 销售机会
- `GET /api/opportunities` - 获取所有销售机会
- `GET /api/opportunities/{id}` - 获取单个销售机会
- `GET /api/opportunities/customer/{customerId}` - 获取客户的销售机会
- `POST /api/opportunities` - 创建销售机会
- `PUT /api/opportunities/{id}` - 更新销售机会
- `DELETE /api/opportunities/{id}` - 删除销售机会
- `GET /api/opportunities/funnel` - 获取销售漏斗数据

### 合同管理
- `GET /api/contracts` - 获取所有合同
- `GET /api/contracts/{id}` - 获取单个合同
- `GET /api/contracts/customer/{customerId}` - 获取客户的合同
- `POST /api/contracts` - 创建合同
- `PUT /api/contracts/{id}` - 更新合同
- `DELETE /api/contracts/{id}` - 删除合同

### 统计分析
- `GET /api/statistics/dashboard` - 获取仪表盘统计数据
- `GET /api/statistics/sales-funnel` - 获取销售漏斗数据

## 数据库

项目使用SQLite数据库，数据库文件位于：
- 开发环境: `crm-backend/data/crm.db`
- Docker环境: 挂载在容器的 `/app/data` 目录

首次启动时，JPA会自动创建所有数据库表。

## 开发说明

### 添加新功能
1. 后端: 创建Entity -> Repository -> Service -> Controller
2. 前端: 创建API调用 -> 页面组件 -> 配置路由

### 注意事项
- 后端使用Lombok简化代码，IDE需要安装Lombok插件
- 前端使用Vite作为构建工具，支持热更新
- CORS已配置，开发环境可以直接跨域调用

## License

MIT
