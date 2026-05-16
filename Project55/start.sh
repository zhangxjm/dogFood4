#!/bin/bash

echo "================================"
echo "二手交易平台 - 启动脚本"
echo "================================"

echo ""
echo "1. 检查Java和Node环境..."

if ! command -v java &> /dev/null; then
    echo "❌ Java未安装，请先安装JDK 11"
    exit 1
fi
echo "✅ Java已安装"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 16+"
    exit 1
fi
echo "✅ Node.js已安装"

echo ""
echo "2. 启动后端服务..."
cd backend

if [ ! -d "target" ] || [ -z "$(ls target/*.jar 2>/dev/null)" ]; then
    echo "正在编译后端项目..."
    mvn clean package -DskipTests
fi

java -jar target/*.jar &
BACKEND_PID=$!
echo "后端服务已启动 (PID: $BACKEND_PID)"

echo ""
echo "3. 等待后端服务启动..."
sleep 15

echo ""
echo "4. 启动前端服务..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install --registry=https://registry.npmmirror.com
fi

npm run dev &
FRONTEND_PID=$!
echo "前端服务已启动 (PID: $FRONTEND_PID)"

echo ""
echo "================================"
echo "启动完成！"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:8080"
echo "================================"
echo ""
echo "按 Ctrl+C 停止服务"

wait
