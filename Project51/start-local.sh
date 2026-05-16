#!/bin/bash

echo "=================================="
echo "医院挂号系统 - 本地启动脚本"
echo "=================================="
echo ""

echo "检查Java环境..."
if ! command -v java &> /dev/null; then
    echo "❌ 未找到Java，请先安装JDK 11"
    exit 1
fi
java -version | head -1

echo ""
echo "检查Maven环境..."
if ! command -v mvn &> /dev/null; then
    echo "❌ 未找到Maven，请先安装Maven"
    exit 1
fi
mvn -version | head -1

echo ""
echo "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js 16+"
    exit 1
fi
node -v

echo ""
echo "=================================="
echo "启动后端服务..."
echo "=================================="
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

echo ""
echo "等待后端启动（约30秒）..."
sleep 30

echo ""
echo "=================================="
echo "启动前端服务..."
echo "=================================="
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "服务启动中！"
echo "=================================="
echo ""
echo "后端地址: http://localhost:8080"
echo "前端地址: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

wait
