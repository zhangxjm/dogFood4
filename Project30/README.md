# 办公用品申领系统

基于 SpringBoot + Vue 3 + Element Plus + MySQL 的公司简易办公用品申领管理系统。

## 功能模块

- **物品分类管理**：管理办公用品的分类信息
- **物品库存管理**：登记物品的库存信息，包括名称、数量、单位、存放位置等
- **员工管理**：管理员工信息，用于申领登记
- **物品申领**：员工申领办公用品，直接登记，无需审批
- **申领记录**：查询历史申领记录，支持按物品、员工、时间范围筛选

## 技术栈

### 后端
- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0
- Lombok
- Validation

### 前端
- Vue 3.4
- Element Plus 2.4
- Vue Router 4
- Axios
- Day.js

## 环境要求

- JDK 17+
- Node.js 18+
- Maven 3.6+
- Docker & Docker Compose

## 快速启动

### 方式一：使用启动脚本

```bash
# 给脚本添加执行权限
chmod +x start.sh

# 执行启动脚本
./start.sh
```

### 方式二：手动启动

#### 1. 启动 MySQL

```bash
docker-compose up -d mysql
```

#### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务地址：http://localhost:8080

#### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务地址：http://localhost:5173

## 访问地址

- 前端：http://localhost:5173
- 后端API：http://localhost:8080/api

## 数据库信息

- 数据库名：office_supplies
- 用户名：admin
- 密码：admin123456
- 端口：3306

## 初始数据

系统启动时会自动初始化以下示例数据：

**物品分类**：
- 办公文具
- 电子设备
- 清洁用品
- 其他

**员工**：
- 张三（EMP001，行政部）
- 李四（EMP002，技术部）
- 王五（EMP003，财务部）

**物品库存**：
- 中性笔、A4打印纸、文件夹、鼠标、键盘、抽纸等

## 项目结构

```
Project30/
├── backend/                 # 后端SpringBoot项目
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/company/officesupplies/
│       │   ├── common/     # 通用类
│       │   ├── config/     # 配置类
│       │   ├── controller/ # 控制器
│       │   ├── dto/        # 数据传输对象
│       │   ├── entity/     # 实体类
│       │   ├── mapper/     # Mapper接口
│       │   └── service/    # 业务逻辑
│       └── resources/
│           ├── application.yml
│           └── schema.sql
├── frontend/               # 前端Vue项目
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── api/           # API接口
│       ├── router/        # 路由配置
│       ├── utils/         # 工具类
│       └── views/         # 页面组件
├── docker-compose.yml      # Docker配置
└── start.sh               # 启动脚本
```

## 停止服务

```bash
# 停止Docker容器
docker-compose down

# 停止后端（查找进程并结束）
pkill -f 'mvn spring-boot:run'

# 停止前端
pkill -f 'npm run dev'
```
