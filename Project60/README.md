# 🎨 少儿兴趣班管理系统

基于 Django + Vue3 + Vant + MySQL 开发的完整少儿兴趣班管理系统

## ✨ 核心功能

- 👦 **学员管理** - 学员信息增删改查
- 📚 **课程管理** - 课程和班级管理
- 💳 **报名缴费** - 一键报名并缴费
- ⏱️ **课时记录** - 上课记录自动扣减课时
- 👨‍🏫 **老师管理** - 老师信息管理
- 📊 **班级统计** - 实时统计班级人数和收费情况

## 🛠️ 技术栈

- **后端**: Python Django + Django REST Framework
- **前端**: Vue3 + Vant 4 + Axios
- **数据库**: MySQL 8.0
- **部署**: Docker + Docker Compose

## 🚀 快速启动

### 方式一：一键启动（推荐）

```bash
chmod +x start.sh
./start.sh
```

### 方式二：手动启动

```bash
# 构建并启动所有服务
docker compose up -d --build
```

## 🌐 访问地址

- **前端页面**: http://localhost:5173
- **后端API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
  - 用户名: `admin`
  - 密码: `admin123`

## 📦 项目结构

```
.
├── backend/                 # Django后端
│   ├── api/                # API应用
│   │   ├── models.py       # 数据模型
│   │   ├── views.py        # API视图
│   │   ├── serializers.py  # 序列化器
│   │   └── urls.py         # 路由配置
│   ├── interest_class/     # Django项目配置
│   ├── init.sql            # 数据库初始化
│   ├── requirements.txt    # Python依赖
│   └── Dockerfile          # 后端Dockerfile
├── frontend/               # Vue3前端
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── router/         # 路由配置
│   │   ├── api/            # API封装
│   │   └── main.js         # 入口文件
│   ├── package.json        # Node依赖
│   ├── vite.config.js      # Vite配置
│   └── Dockerfile          # 前端Dockerfile
├── docker compose.yml      # Docker编排配置
└── start.sh                # 启动脚本
```

## 🔧 核心特性实现

### 课时自动扣减

```python
# 创建上课记录时自动扣减所有学员课时
class ClassRecord(models.Model):
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new:
            self.deduct_hours()

    def deduct_hours(self):
        enrollments = Enrollment.objects.filter(
            class_info=self.class_info,
            status='active'
        )
        for enrollment in enrollments:
            enrollment.remaining_hours -= self.hours
            enrollment.save()
```

### 班级人数统计

```python
class ClassInfo(models.Model):
    @property
    def student_count(self):
        return self.enrollment_set.filter(status='active').count()
```

### 缴费记录管理

所有报名操作自动创建缴费记录，支持多种支付方式

## 📊 初始化数据

系统启动后会自动创建以下测试数据：

- 5位老师（张老师、李老师、王老师等）
- 5门课程（绘画、钢琴、舞蹈、书法、围棋）
- 8名学员
- 3个班级
- 报名记录和缴费记录

## 📝 常用命令

```bash
# 查看服务日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 进入后端容器
docker compose exec backend bash

# 进入MySQL容器
docker compose exec mysql bash
```

## 🔐 安全说明

- 本项目为演示项目，生产环境请修改默认密码
- 建议启用JWT认证进行API保护
- 数据库密码请使用环境变量配置

## 📄 License

MIT
