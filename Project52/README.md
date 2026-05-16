# 🌍 旅游攻略分享平台

基于 Python Flask + React + Ant Design + SQLite 构建的旅游攻略分享平台。

## ✨ 核心功能

- 📝 **攻略发布**：支持富文本编辑、多图片上传
- 🏷️ **攻略分类**：国内游、海外游、自驾游、徒步游等分类
- 👍 **点赞系统**：用户可点赞喜欢的攻略
- 💬 **评论功能**：支持对攻略进行评论
- 🔥 **热门推荐**：基于点赞数、评论数、浏览量和时间衰减的热门排序算法
- 👤 **用户中心**：个人资料管理、我的攻略

## 🛠️ 技术栈

**后端：**
- Python Flask 3.0
- Flask-SQLAlchemy (ORM)
- Flask-JWT-Extended (认证)
- SQLite (数据库)

**前端：**
- React 18
- Ant Design 5
- React Router 6
- Axios
- Vite (构建工具)

## 🚀 快速启动

### 方式一：一键启动（推荐）

```bash
# 1. 安装依赖
chmod +x install.sh start.sh
./install.sh

# 2. 启动项目
./start.sh
```

### 方式二：分别启动

```bash
# 启动后端（端口 5000）
cd backend
pip install -r requirements.txt
python run.py

# 启动前端（端口 3000，新开终端）
cd frontend
npm install
npm run dev
```

## 🌐 访问地址

- 前端页面：http://localhost:3000
- 后端 API：http://localhost:5000

## 📁 项目结构

```
Project52/
├── backend/                 # 后端 Flask 项目
│   ├── app/
│   │   ├── api/            # API 接口
│   │   │   ├── auth.py    # 用户认证
│   │   │   ├── guide.py   # 攻略管理
│   │   │   ├── comment.py # 评论管理
│   │   │   └── category.py # 分类管理
│   │   ├── models.py      # 数据模型
│   │   └── uploads/       # 图片上传目录
│   ├── run.py             # 启动文件
│   └── requirements.txt   # Python 依赖
├── frontend/               # 前端 React 项目
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 公共组件
│   │   ├── services/      # API 服务
│   │   └── utils/         # 工具函数
│   ├── package.json
│   └── vite.config.js
├── install.sh             # 依赖安装脚本
└── start.sh               # 项目启动脚本
```

## 📋 API 接口说明

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新个人资料

### 攻略管理
- `GET /api/guides` - 获取攻略列表（支持分页、分类、排序、搜索）
- `GET /api/guides/hot` - 获取热门攻略
- `GET /api/guides/:id` - 获取攻略详情
- `POST /api/guides` - 创建攻略
- `PUT /api/guides/:id` - 更新攻略
- `DELETE /api/guides/:id` - 删除攻略
- `POST /api/guides/upload` - 上传图片
- `POST /api/guides/:id/like` - 切换点赞状态
- `GET /api/guides/:id/like-status` - 获取点赞状态
- `GET /api/guides/user/:user_id` - 获取用户攻略列表

### 评论管理
- `POST /api/comments` - 发表评论
- `GET /api/comments/guide/:guide_id` - 获取攻略评论

### 分类管理
- `GET /api/categories` - 获取所有分类

## 🔥 热门排序算法

算法基于以下因素计算攻略的热门分数：
- 点赞数（权重 10）
- 评论数（权重 5）
- 浏览量（权重 1）
- 时间衰减因子（使用 1.8 次方衰减）

```
分数 = (点赞数*10 + 评论数*5 + 浏览量) / (小时数 + 2)^1.8
```

## 📝 使用说明

1. 注册账号并登录
2. 点击"发布攻略"创建你的第一篇攻略
3. 上传旅行照片，填写攻略内容
4. 浏览首页推荐的热门攻略
5. 对喜欢的攻略进行点赞和评论
6. 在"个人中心"查看和管理自己的攻略

## 🎯 特色功能

1. **多图片上传**：支持批量上传旅行照片
2. **实时热门排行**：基于算法动态调整热门攻略排名
3. **响应式设计**：支持移动端和桌面端访问
4. **JWT 认证**：安全的用户身份验证
5. **图片预览**：攻略图片支持画廊预览
