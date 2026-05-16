#!/bin/bash

echo "=================================="
echo "医院挂号系统 - 快速启动（H2内存数据库）"
echo "无需安装MySQL，一键启动！"
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
echo "编译后端..."
echo "=================================="
cd backend
mvn clean compile -DskipTests

echo ""
echo "=================================="
echo "启动后端服务（使用H2内存数据库）..."
echo "=================================="
mvn spring-boot:run -Dspring-boot.run.profiles=h2 &
BACKEND_PID=$!

echo ""
echo "等待后端启动（约30秒）..."
sleep 30

echo ""
echo "=================================="
echo "启动前端服务..."
echo "=================================="
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================="
echo "✅ 服务启动成功！"
echo "=================================="
echo ""
echo "📊 H2数据库控制台: http://localhost:8080/h2-console"
echo "   JDBC URL: jdbc:h2:mem:hospital_db"
echo "   用户名: sa"
echo "   密码: (空)"
echo ""
echo "🌐 前端地址: http://localhost:5173"
echo "🔙 后端API: http://localhost:8080"
echo ""
echo "💡 已自动初始化5个科室和5位医生"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

trap "echo ''" INT TERM
wait
