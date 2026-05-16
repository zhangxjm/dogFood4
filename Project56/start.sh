#!/bin/bash

echo "🚀 启动餐饮后厨叫号系统..."

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 请先安装 Python 3"
    exit 1
fi

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

echo "📦 安装后端依赖..."
cd backend
pip3 install -r requirements.txt -q

echo "📦 安装前端依赖..."
cd ../frontend
npm install --silent

echo "🔧 构建前端项目..."
npm run build

echo "🎉 启动服务..."
echo ""
echo "📋 API文档: http://localhost:8000/docs"
echo "🌐 前端地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止服务"

cd ../backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
