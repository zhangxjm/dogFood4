#!/bin/bash

echo "=========================================="
echo "     水果店管理系统 - 启动脚本"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    echo "✓ Docker 和 Docker Compose 已就绪"
}

check_go() {
    if ! command -v go &> /dev/null; then
        echo "⚠️ Go 未安装，将使用 Docker 运行后端"
        return 1
    fi
    echo "✓ Go 已就绪: $(go version)"
    return 0
}

check_node() {
    if ! command -v node &> /dev/null; then
        echo "⚠️ Node.js 未安装，将使用 Docker 运行前端"
        return 1
    fi
    echo "✓ Node.js 已就绪: $(node --version)"
    return 0
}

start_docker() {
    echo ""
    echo "🚀 使用 Docker 启动项目..."
    echo ""
    
    check_docker
    
    echo "📦 构建并启动容器..."
    docker-compose up -d --build
    
    echo ""
    echo "⏳ 等待服务启动..."
    sleep 5
    
    echo ""
    echo "✅ 项目已启动！"
    echo ""
    echo "📱 前端地址: http://localhost"
    echo "🔧 后端地址: http://localhost:8080"
    echo ""
    echo "查看日志: docker-compose logs -f"
    echo "停止项目: docker-compose down"
    echo ""
}

start_local() {
    echo ""
    echo "🚀 使用本地环境启动项目..."
    echo ""
    
    mkdir -p data
    
    echo "📦 安装后端依赖..."
    cd "$PROJECT_DIR/backend"
    go mod tidy
    
    echo "🔧 启动后端服务 (端口 8080)..."
    go run main.go &
    BACKEND_PID=$!
    
    echo "⏳ 等待后端启动..."
    sleep 3
    
    echo "📦 安装前端依赖..."
    cd "$PROJECT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    echo "🌐 启动前端服务 (端口 5173)..."
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "✅ 项目已启动！"
    echo ""
    echo "📱 前端地址: http://localhost:5173"
    echo "🔧 后端地址: http://localhost:8080"
    echo ""
    echo "按 Ctrl+C 停止服务"
    echo ""
    
    wait $BACKEND_PID $FRONTEND_PID
}

stop_services() {
    echo ""
    echo "🛑 正在停止服务..."
    pkill -f "go run main.go" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    echo "✅ 服务已停止"
}

trap stop_services EXIT

echo "📋 环境检查..."
check_go
GO_READY=$?
check_node
NODE_READY=$?

echo ""
echo "请选择启动方式："
echo "1) Docker 启动（推荐，无需安装 Go 和 Node）"
echo "2) 本地启动（需要安装 Go 和 Node.js）"
echo "3) 仅启动后端"
echo "4) 仅启动前端"
echo "5) 停止所有服务"
echo ""

read -p "请输入选项 [1-5]: " choice

case $choice in
    1)
        start_docker
        ;;
    2)
        if [ $GO_READY -ne 0 ] || [ $NODE_READY -ne 0 ]; then
            echo ""
            echo "❌ 本地环境不完整，建议使用 Docker 方式"
            exit 1
        fi
        start_local
        ;;
    3)
        echo "🔧 仅启动后端..."
        cd "$PROJECT_DIR/backend"
        go mod tidy
        go run main.go
        ;;
    4)
        echo "🌐 仅启动前端..."
        cd "$PROJECT_DIR/frontend"
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        npm run dev
        ;;
    5)
        stop_services
        docker-compose down 2>/dev/null || true
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac
