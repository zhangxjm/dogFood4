# 医院挂号系统 (简易版)

## 技术栈
- 后端：Java SpringBoot 2.7 + JPA
- 前端：Vue 3 + Bootstrap 5
- 数据库：H2（内存）/ MySQL 8.0
- 容器化：Docker + Docker Compose

## 核心功能
1. **科室管理** - 管理医院科室信息
2. **医生管理** - 管理医生信息和职称
3. **排班管理** - 医生排班管理，支持号源数量控制
4. **在线挂号** - 患者在线挂号，支持挂号时间限制
5. **挂号记录查询** - 查询挂号记录，支持取消挂号
6. **医生出诊统计** - 按时间段统计医生出诊挂号数量

## 🚀 快速启动（推荐！无需Docker）

### 方式一：H2内存数据库 - 一键启动 ⭐⭐⭐
**无需安装MySQL，最简单的启动方式**

```bash
./start-quick.sh
```

启动后访问：
- 前端：http://localhost:5173
- 后端：http://localhost:8080
- H2数据库控制台：http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:hospital_db`
  - 用户名: `sa`
  - 密码: (空)

### 方式二：本地开发启动（需要MySQL）
1. 启动MySQL数据库，创建数据库 `hospital_db`
2. 修改 `backend/src/main/resources/application.yml` 中的数据库配置
3. 启动后端：
   ```bash
   cd backend
   mvn spring-boot:run
   ```
4. 启动前端：
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### 方式三：Docker启动（如遇镜像问题请改用方式一）
```bash
docker-compose up -d --build
```

## 数据库配置

### H2内存数据库（默认用于快速启动）
- 无需配置，自动创建
- 数据在应用停止后清除
- 适合开发和演示

### MySQL数据库
- 数据库名: hospital_db
- 用户名: root
- 密码: 123456
- 端口: 3306

## 系统特性
- **号源数量控制**：排班时设置总号源数，挂号时自动扣减剩余号源
- **挂号时间限制**：只能挂当前及未来日期的号，排班截止时间后无法挂号
- **排班冲突检测**：同一医生同一时段无法重复排班
- **取消挂号退款**：取消挂号后自动返还号源
- **自动初始化数据**：启动时自动创建5个科室和5位医生

## 项目结构
```
Project51/
├── backend/                      # 后端SpringBoot项目
│   ├── src/main/java/           # Java源码
│   │   ├── entity/              # 数据库实体
│   │   ├── repository/          # 数据访问层
│   │   ├── service/             # 业务逻辑层
│   │   ├── controller/          # REST API控制器
│   │   ├── config/              # 配置类（CORS、数据初始化）
│   │   └── dto/                # 数据传输对象
│   ├── src/main/resources/      # 配置文件
│   │   ├── application.yml      # MySQL配置
│   │   ├── application-h2.yml   # H2内存数据库配置
│   │   └── init.sql             # MySQL初始化脚本
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                    # 前端Vue3项目
│   ├── src/
│   │   ├── views/               # 7个页面组件
│   │   ├── router/              # 路由配置
│   │   ├── api/                 # API封装
│   │   ├── App.vue
│   │   └── main.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── start-quick.sh              # 快速启动脚本（H2数据库）
├── start-local.sh              # 本地启动脚本
├── start.sh                    # Docker启动脚本
└── README.md
```

## API接口
- 科室管理: `/api/departments`
- 医生管理: `/api/doctors`
- 排班管理: `/api/schedules`
- 挂号管理: `/api/registrations`
- 统计分析: `/api/statistics`

## 初始化数据
系统启动后自动初始化：
- **5个科室**：内科、外科、儿科、妇产科、骨科
- **5位医生**：包含职称和所属科室配置

## 使用说明

### 1. 排班管理
1. 进入"排班管理"页面
2. 选择日期查看当天排班
3. 点击新增排班，选择医生、日期、时段、设置号源数量

### 2. 在线挂号
1. 进入"在线挂号"页面
2. 选择科室和日期，查看可挂号的排班
3. 点击"立即挂号"，填写患者信息完成挂号

### 3. 挂号记录查询
1. 进入"挂号记录"页面
2. 可按手机号查询特定患者的挂号记录
3. 可取消未就诊的挂号

### 4. 出诊统计
1. 进入"出诊统计"页面
2. 选择时间范围
3. 查看各医生的挂号数量统计

## 常见问题

**Q: Docker镜像拉取失败怎么办？**
A: 使用方式一 `./start-quick.sh`，无需Docker，使用H2内存数据库。

**Q: H2数据库数据会丢失吗？**
A: 是的，H2是内存数据库，应用重启后数据会重置。如需持久化，请使用MySQL。

**Q: 如何切换到MySQL数据库？**
A: 修改 `backend/src/main/resources/application.yml` 中的数据库配置，确保MySQL已启动并创建了 `hospital_db` 数据库。
