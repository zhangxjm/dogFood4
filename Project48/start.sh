#!/bin/bash

echo "========================================"
echo "  奶茶店收银系统 - 启动脚本"
echo "========================================"

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ 错误: 未检测到 Java，请先安装 JDK 11 或更高版本"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js 16 或更高版本"
    exit 1
fi

echo ""
echo "📦 正在安装后端依赖..."
cd backend
if [ ! -d "target" ]; then
    mvn clean package -DskipTests
fi

echo ""
echo "🚀 正在启动后端服务 (端口: 8080)..."
mvn spring-boot:run &
BACKEND_PID=$!

echo ""
echo "📦 正在安装前端依赖..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "🚀 正在启动前端服务 (端口: 3000)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  系统启动完成！"
echo "  前端地址: http://localhost:3000"
echo "  后端API:  http://localhost:8080"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait
