@echo off
chcp 65001 >nul
echo 🚀 启动餐饮后厨叫号系统...

echo 📦 安装后端依赖...
cd backend
pip install -r requirements.txt -q

echo 📦 安装前端依赖...
cd ..\frontend
npm install --silent

echo 🔧 构建前端项目...
npm run build

echo 🎉 启动服务...
echo.
echo 📋 API文档: http://localhost:8000/docs
echo 🌐 前端地址: http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务

cd ..\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
