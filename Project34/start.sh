#!/bin/bash

echo "======================================"
echo "个人书单收藏系统"
echo "======================================"
echo ""

# 检查 Java 是否安装
if ! command -v java &> /dev/null; then
    echo "❌ 错误: 未检测到 Java，请先安装 JDK 17+"
    exit 1
fi

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo "❌ 错误: 未检测到 Maven，请先安装 Maven"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 创建数据库目录
mkdir -p backend/data

echo "📦 正在安装前端依赖..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 前端依赖安装失败"
    exit 1
fi
cd ..

echo ""
echo "🚀 正在启动后端服务..."
cd backend
mvn spring-boot:run > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "后端 PID: $BACKEND_PID"
cd ..

echo ""
echo "⏳ 等待后端服务启动..."
sleep 15

echo ""
echo "🌐 正在启动前端服务..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端 PID: $FRONTEND_PID"
cd ..

sleep 5

echo ""
echo "======================================"
echo "🎉 系统启动成功！"
echo "======================================"
echo ""
echo "📊 后端地址: http://localhost:8080"
echo "🌐 前端地址: http://localhost:5173"
echo ""
echo "📝 后端日志: tail -f backend.log"
echo "📝 前端日志: tail -f frontend.log"
echo ""
echo "🛑 停止服务: kill $BACKEND_PID $FRONTEND_PID"
echo "======================================"

# 保存 PID
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid
