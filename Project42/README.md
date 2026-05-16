# 个人博客系统

基于 **Django + Vue3 + Bootstrap + MySQL** 构建的现代化个人博客系统。

## 功能特性

### 核心功能

- 📝 **文章发布** - 支持Markdown编辑器，实时预览
- 🏷️ **分类标签** - 文章分类管理，标签云
- 💬 **评论管理** - 游客评论，后台审核机制
- 📊 **访客统计** - IP追踪，每日统计数据
- 🔍 **文章搜索** - 全文搜索功能
- 🌙 **主题切换** - 支持亮色/暗色主题

### 后台管理

- 文章管理（发布、编辑、删除）
- 分类管理
- 标签管理
- 评论审核（通过/拒绝）
- 访客统计面板

## 技术栈

### 后端

- **Django 4.2** - Web框架
- **Django REST Framework** - API接口
- **MySQL** - 关系型数据库
- **SimpleJWT** - JWT认证
- **django-filter** - 数据过滤

### 前端

- **Vue 3** - 渐进式JavaScript框架
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Vite** - 构建工具
- **Bootstrap 5** - UI框架
- **mavon-editor** - Markdown编辑器
- **Axios** - HTTP客户端

## 快速启动

### 环境要求

- Docker & Docker Compose
- 至少 2GB 可用内存

### 一键启动

```bash
# 方式1：使用启动脚本（推荐）
chmod +x start.sh
./start.sh

# 方式2：手动使用docker compose
docker compose up -d
```

### 访问地址

启动成功后，可以访问以下地址：

| 服务           | 地址                        | 说明           |
| -------------- | --------------------------- | -------------- |
| 前端首页       | http://localhost:3000       | 博客前台       |
| 后端API        | http://localhost:8000       | API接口        |
| Django管理后台 | http://localhost:8000/admin | Django自带后台 |
| 博客管理后台   | http://localhost:3000/admin | 前端管理页面   |

### 默认账号

```
用户名: admin
密码: admin123456
```

## 项目结构

```
Project42/
├── backend/                 # Django后端
│   ├── blog/               # 博客应用
│   │   ├── models.py       # 数据模型
│   │   ├── views.py        # 视图接口
│   │   ├── serializers.py  # 序列化器
│   │   ├── admin.py        # 后台管理
│   │   └── middleware.py   # 中间件
│   ├── blog_project/       # 项目配置
│   ├── manage.py           # Django管理脚本
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile          # 后端Docker配置
├── frontend/               # Vue前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── views/          # 页面视图
│   │   ├── stores/         # Pinia状态
│   │   ├── router/         # 路由配置
│   │   └── api/            # API封装
│   ├── package.json        # Node依赖
│   ├── vite.config.js      # Vite配置
│   └── Dockerfile          # 前端Docker配置
├── docker compose.yml      # Docker编排
├── start.sh               # 启动脚本
└── README.md              # 项目说明
```

## 数据模型

### 核心模型

- **Category** - 文章分类
- **Tag** - 文章标签
- **Article** - 文章内容
- **Comment** - 评论信息
- **Visitor** - 访客记录
- **DailyStats** - 每日统计

## 常用命令

### Docker相关

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止所有服务
docker compose down

# 重启服务
docker compose restart
```

### 后端开发

```bash
# 进入后端容器
docker compose exec backend bash

# 创建数据库迁移
python manage.py makemigrations

# 执行迁移
python manage.py migrate

# 创建超级用户
python manage.py createsuperuser
```

### 前端开发

```bash
# 进入前端容器
docker compose exec frontend bash

# 安装依赖
npm install

# 热重载开发
npm run dev
```

## API接口说明

### 认证接口

- `POST /api/token/` - 获取JWT Token
- `POST /api/token/refresh/` - 刷新Token

### 文章接口

- `GET /api/articles/` - 获取文章列表
- `GET /api/articles/{id}/` - 获取文章详情
- `POST /api/articles/` - 创建文章
- `PUT /api/articles/{id}/` - 更新文章
- `DELETE /api/articles/{id}/` - 删除文章

### 分类/标签接口

- `GET /api/categories/` - 分类列表
- `GET /api/tags/` - 标签列表

### 评论接口

- `GET /api/comments/` - 评论列表
- `POST /api/comments/` - 创建评论
- `POST /api/comments/{id}/approve/` - 审核通过
- `POST /api/comments/{id}/reject/` - 审核拒绝

### 统计接口

- `GET /api/dashboard/stats/` - 仪表盘统计
- `GET /api/visitors/` - 访客列表
- `GET /api/daily-stats/` - 每日统计

## 功能截图

### 前台首页

- 文章列表展示
- 侧边栏分类/标签/最新文章
- 搜索功能

### 文章详情

- Markdown渲染
- 评论区
- 浏览统计

### 后台管理

- 仪表盘统计卡片
- 文章CRUD
- Markdown编辑器
- 评论审核
- 访客统计

## 开发说明

### 添加新功能

1. 后端：在 `backend/blog/models.py` 添加模型
2. 创建/更新序列化器和视图
3. 前端：在 `frontend/src/api/` 添加API封装
4. 创建对应的Vue组件和路由

### 主题定制

- 亮色/暗色主题由Pinia Store管理
- 在 `frontend/src/stores/theme.js` 配置
- 组件通过CSS变量自动适配主题

## 常见问题

### 数据库连接失败

- 确保MySQL容器已启动：`docker compose ps`
- 查看MySQL日志：`docker compose logs mysql`
- 等待MySQL完全启动（约15秒）

### 前端热重载不生效

- 检查Vite配置中的watch选项
- 重启前端容器：`docker compose restart frontend`

### 后端API 403错误

- 检查JWT Token是否有效
- 确认用户有相应权限

## 许可证

MIT License
