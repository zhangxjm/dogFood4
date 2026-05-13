#!/bin/bash

echo "=========================================="
echo "  外卖小店商家后台 - 项目启动"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 项目目录: $PROJECT_DIR"
echo ""

install_backend_deps() {
    echo "🔧 安装后端依赖..."
    cd "$PROJECT_DIR/backend"
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -r requirements.txt -q
    echo "✅ 后端依赖安装完成"
}

install_frontend_deps() {
    echo "🔧 安装前端依赖..."
    cd "$PROJECT_DIR/frontend"
    if [ ! -d "node_modules" ]; then
        npm install --silent
    fi
    echo "✅ 前端依赖安装完成"
}

start_backend() {
    echo "🚀 启动后端服务 (端口: 8000)..."
    cd "$PROJECT_DIR/backend"
    source venv/bin/activate
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "✅ 后端服务已启动 PID: $BACKEND_PID"
}

start_frontend() {
    echo "🚀 启动前端服务 (端口: 5173)..."
    cd "$PROJECT_DIR/frontend"
    npm run dev -- --host 0.0.0.0 &
    FRONTEND_PID=$!
    echo "✅ 前端服务已启动 PID: $FRONTEND_PID"
}

install_backend_deps
install_frontend_deps

echo ""
echo "=========================================="
echo "  启动服务中..."
echo "=========================================="
echo ""

start_backend
sleep 3
start_frontend

echo ""
echo "=========================================="
echo "  服务启动完成！"
echo "=========================================="
echo ""
echo "🌐 前端地址: http://localhost:5173"
echo "🔧 后端地址: http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

trap "echo ''; echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

wait
