#!/bin/bash

echo "🚀 正在启动少儿兴趣班管理系统..."
echo "============================================"

# 检查是否安装了 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到 Docker，请先安装 Docker"
    exit 1
fi

# 检查是否安装了 Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ 未检测到 Docker Compose，请先安装 Docker Compose"
    exit 1
fi

# 检查是否安装了 Java (17+)
if ! command -v java &> /dev/null; then
    echo "❌ 未检测到 Java，请先安装 Java 17+"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d. -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ 需要 Java 17+，当前版本为 Java $JAVA_VERSION"
    exit 1
fi

# 检查是否安装了 Node.js 和 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm，请先安装 Node.js"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 启动 MySQL
echo "📦 正在启动 MySQL 数据库..."
if docker compose ps | grep -q "mysql"; then
    echo "✅ MySQL 已经在运行"
else
    docker compose up -d mysql
    echo "⏳ 等待 MySQL 启动..."
    sleep 10
fi

echo ""

# 构建并启动后端
echo "🔧 正在构建后端项目..."
cd backend

if [ ! -f "target/backend-0.0.1-SNAPSHOT.jar" ]; then
    if command -v mvn &> /dev/null; then
        mvn clean package -DskipTests
    elif [ -f "mvnw" ]; then
        chmod +x mvnw
        ./mvnw clean package -DskipTests
    else
        echo "❌ 未检测到 Maven 或 Maven Wrapper"
        exit 1
    fi
else
    echo "✅ 后端项目已构建"
fi

echo ""
echo "🚀 正在启动后端服务..."
java -jar target/backend-0.0.1-SNAPSHOT.jar &
BACKEND_PID=$!
echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
echo "📍 后端服务地址: http://localhost:8080"

echo ""
echo "⏳ 等待后端服务完全启动..."
sleep 15

echo ""

# 构建并启动前端
cd ../frontend

echo "🔧 正在安装前端依赖..."
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ 前端依赖已安装"
fi

echo ""
echo "🚀 正在启动前端服务..."
npm run dev &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo "📍 前端服务地址: http://localhost:5173"

echo ""
echo "============================================"
echo "🎉 少儿兴趣班管理系统已成功启动！"
echo ""
echo "📖 使用说明："
echo "1. 前端访问地址: http://localhost:5173"
echo "2. 后端API地址: http://localhost:8080"
echo "3. 数据库端口: 3306"
echo "4. 按 Ctrl+C 停止所有服务"
echo "============================================"

# 捕获 Ctrl+C 并停止服务
trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; cd ..; docker compose down; echo '✅ 服务已停止'; exit" INT

# 保持脚本运行
wait
