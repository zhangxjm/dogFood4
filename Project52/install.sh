#!/bin/bash

echo "🚀 正在安装旅游攻略分享平台依赖..."

# 安装后端依赖
echo "📦 安装后端 Python 依赖..."
cd backend
pip3 install -r requirements.txt
cd ..

# 安装前端依赖
echo "📦 安装前端 Node.js 依赖..."
cd frontend
npm install
cd ..

echo "✅ 依赖安装完成！"
echo ""
echo "📋 启动方式："
echo "   方式一：分别启动前后端"
echo "     后端：cd backend && python3 run.py"
echo "     前端：cd frontend && npm run dev"
echo ""
echo "   方式二：使用启动脚本（推荐）"
echo "     ./start.sh"
