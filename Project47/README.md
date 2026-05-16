# 驾校学员管理系统

基于 Go Beego + Vue3 + Element Plus + MySQL 开发的驾校学员管理系统。

## 功能特性

- **学员管理**：学员报名、信息编辑、学员查询
- **教练管理**：教练信息录入、编辑、查询
- **科目预约**：学员预约练车、教练时段管理、预约冲突检测
- **学时记录**：自动累计学时、学时查询统计
- **考试成绩录入**：成绩录入、自动升级科目、毕业判定
- **统计报表**：毕业学员统计、各科目通过率、平均成绩

## 技术栈

- **后端**：Go + Beego v2
- **前端**：Vue3 + Element Plus
- **数据库**：MySQL 8.0
- **容器化**：Docker + Docker Compose

## 快速启动

### 方式一：Docker启动（推荐）

```bash
# 1. 克隆项目后进入目录
cd Project47

# 2. 给启动脚本添加执行权限
chmod +x start.sh

# 3. 一键启动
./start.sh

# 或手动执行
docker compose up -d
```

启动成功后访问：

- 前端：http://localhost:3000
- 后端API：http://localhost:8080

### 方式二：本地开发启动

**启动后端**：

```bash
cd backend
go mod tidy
go run main.go
```

**启动前端**：

```bash
cd frontend
npm install
npm run dev
```

**注意**：本地启动需要先安装 MySQL 并创建数据库 `driving_school`。

## 项目结构

```
Project47/
├── backend/                 # 后端项目
│   ├── conf/               # 配置文件
│   ├── controllers/        # 控制器
│   ├── models/            # 数据模型
│   ├── routers/           # 路由配置
│   ├── main.go            # 入口文件
│   ├── go.mod             # Go依赖
│   └── Dockerfile         # 后端Docker配置
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── router/       # 路由配置
│   │   ├── api/          # API封装
│   │   └── main.js       # 入口文件
│   ├── package.json      # 前端依赖
│   ├── vite.config.js    # Vite配置
│   ├── nginx.conf        # Nginx配置
│   └── Dockerfile        # 前端Docker配置
├── docker compose.yml     # Docker编排配置
├── start.sh              # 一键启动脚本
└── README.md
```

## API接口

| 模块 | 接口                           | 方法   | 说明                      |
| ---- | ------------------------------ | ------ | ------------------------- |
| 学员 | /api/v1/students               | GET    | 获取学员列表              |
| 学员 | /api/v1/students               | POST   | 新增学员                  |
| 学员 | /api/v1/students/:id           | PUT    | 更新学员                  |
| 学员 | /api/v1/students/:id           | DELETE | 删除学员                  |
| 教练 | /api/v1/coaches                | GET    | 获取教练列表              |
| 教练 | /api/v1/coaches                | POST   | 新增教练                  |
| 预约 | /api/v1/reservations           | GET    | 获取预约列表              |
| 预约 | /api/v1/reservations           | POST   | 新增预约（含冲突检测）    |
| 学时 | /api/v1/studyhours             | GET    | 获取学时记录              |
| 学时 | /api/v1/studyhours/student/:id | GET    | 获取学员学时统计          |
| 成绩 | /api/v1/examscores             | GET    | 获取成绩列表              |
| 成绩 | /api/v1/examscores             | POST   | 录入成绩（自动升科/毕业） |
| 统计 | /api/v1/statistics/dashboard   | GET    | 仪表盘数据                |
| 统计 | /api/v1/statistics/pass-rate   | GET    | 各科目通过率              |

## 核心难点实现

### 1. 学时自动累计

- 每次新增学时记录时自动累加
- 按科目维度统计总学时
- 支持按学员查询学时详情

### 2. 科目预约限制

- 检测学员当天是否已有预约
- 检测教练同时段是否已被预约
- 防止重复预约和时间冲突

### 3. 数据统计报表

- 实时统计总学员数、毕业学员数
- 各科目通过率计算
- 平均成绩统计分析

## 常用命令

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 重新构建并启动
docker compose up -d --build
```

## 数据库配置

默认数据库配置：

- 主机：localhost
- 端口：3306
- 用户名：root
- 密码：123456
- 数据库名：driving_school

如需修改，请编辑 `docker compose.yml` 或 `backend/conf/app.conf`。

## 开发说明

### 新增API接口

1. 在 `backend/controllers/` 下创建对应控制器
2. 添加 `// @router` 注解定义路由
3. 实现业务逻辑

### 新增前端页面

1. 在 `frontend/src/views/` 下创建页面组件
2. 在 `frontend/src/router/index.js` 中配置路由
3. 在侧边栏菜单中添加导航（App.vue）

## License

MIT
