# 🍽️ 餐饮后厨叫号系统

基于 Python FastAPI + Vue3 + Element Plus + SQLite 的现代化餐饮叫号系统

## ✨ 功能特性

- 📝 **订单录入** - 快捷菜单选择，自动计算金额
- 📢 **实时叫号** - WebSocket 实时推送，语音提示
- 🔄 **状态管理** - 等待中 → 制作中 → 已完成 → 已取餐
- 📊 **销售统计** - 今日订单、销售额、完成情况
- 📋 **订单管理** - 完整的订单生命周期管理

## 🛠️ 技术栈

- **后端**: FastAPI + SQLAlchemy + SQLite
- **前端**: Vue3 + Element Plus + Axios
- **实时通信**: WebSocket

## 🚀 快速启动

### macOS/Linux
```bash
chmod +x start.sh
./start.sh
```

### Windows
```cmd
start.bat
```

## 🌐 访问地址

- **前端页面**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 📁 项目结构

```
Project56/
├── backend/                 # 后端服务
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── models.py       # 数据模型
│   │   ├── schemas.py      # Pydantic模式
│   │   ├── database.py     # 数据库配置
│   │   └── main.py         # 应用入口
│   └── requirements.txt
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── views/         # 页面组件
│   │   ├── api/           # API封装
│   │   ├── router/        # 路由配置
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── start.sh               # Linux/macOS启动脚本
├── start.bat              # Windows启动脚本
└── README.md
```

## 📋 使用说明

### 1. 订单录入
- 输入顾客姓名
- 选择菜品（支持多选）
- 系统自动计算总金额
- 点击提交创建订单

### 2. 叫号显示
- 查看当前呼叫的订单号
- 等待队列显示所有待处理订单
- 点击"呼叫"按钮叫号
- 叫号时自动播放提示音和弹出通知

### 3. 订单管理
- 查看所有今日订单
- 更新订单状态（制作中/已完成/已取餐）
- 手动呼叫未叫号的订单

### 4. 销售统计
- 今日订单总数
- 今日销售总额
- 已完成/待处理订单数
- 详细订单列表

## 🔧 开发模式

### 单独启动后端
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 单独启动前端
```bash
cd frontend
npm install
npm run dev
```
