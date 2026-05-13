#!/bin/bash

echo "=========================================="
echo "   办公用品申领系统启动脚本"
echo "=========================================="

PROJECT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$PROJECT_DIR"

echo ""
echo "[1/4] 检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo "❌ 未检测到Docker，请先安装Docker"
    exit 1
fi
if ! command -v docker-compose &> /dev/null; then
    echo "❌ 未检测到docker-compose，请先安装"
    exit 1
fi
echo "✅ Docker环境已就绪"

echo ""
echo "[2/4] 启动MySQL容器..."
docker-compose up -d mysql
echo "⏳ 等待MySQL启动完成（约30秒）..."
sleep 30

echo ""
echo "[3/4] 检查Maven环境并启动后端..."
if command -v mvn &> /dev/null; then
    echo "✅ Maven环境已就绪"
    cd "$PROJECT_DIR/backend"
    echo "🚀 启动后端服务（端口8080）..."
    mvn spring-boot:run > "$PROJECT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "⏳ 等待后端服务启动..."
    sleep 45
    cd "$PROJECT_DIR"
else
    echo "⚠️  未检测到Maven，请手动安装后执行："
    echo "   cd backend && mvn spring-boot:run"
fi

echo ""
echo "[4/4] 检查Node.js环境并启动前端..."
if command -v npm &> /dev/null; then
    echo "✅ Node.js环境已就绪"
    cd "$PROJECT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        echo "📦 安装前端依赖..."
        npm install
    fi
    echo "🚀 启动前端服务（端口5173）..."
    npm run dev > "$PROJECT_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    sleep 10
    cd "$PROJECT_DIR"
else
    echo "⚠️  未检测到Node.js，请手动安装后执行："
    echo "   cd frontend && npm install && npm run dev"
fi

echo ""
echo "=========================================="
echo "   启动完成！"
echo "=========================================="
echo ""
echo "🌐 访问地址："
echo "   前端：http://localhost:5173"
echo "   后端API：http://localhost:8080"
echo ""
echo "📋 日志文件："
echo "   后端日志：$PROJECT_DIR/backend.log"
echo "   前端日志：$PROJECT_DIR/frontend.log"
echo ""
echo "💾 停止命令："
echo "   docker-compose down"
echo "   pkill -f 'mvn spring-boot:run'"
echo "   pkill -f 'npm run dev'"
echo ""
