#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🐕 宠物店管理系统启动脚本"
echo "================================"
echo "项目目录: $SCRIPT_DIR"
echo ""

export GOPROXY=https://goproxy.cn,direct
export CGO_ENABLED=1

if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command -v go &> /dev/null; then
    echo "❌ 未检测到 Go，请先安装 Go 1.21+"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

echo "📦 安装后端依赖..."
cd "$BACKEND_DIR" && go mod tidy
echo "✅ 后端依赖安装完成"
echo ""

echo "📦 安装前端依赖..."
cd "$FRONTEND_DIR" && npm install
echo "✅ 前端依赖安装完成"
echo ""

echo "🚀 启动后端服务 (端口: 8080)"
cd "$BACKEND_DIR" && go run main.go &
BACKEND_PID=$!

echo "⏳ 等待后端服务启动..."
sleep 10

if curl -s http://localhost:8080/api/pets > /dev/null 2>&1; then
    echo "✅ 后端服务已启动 (PID: $BACKEND_PID)"
else
    echo "⚠️  后端服务正在初始化，请稍后..."
fi
echo ""

echo "🚀 启动前端服务 (端口: 8081)"
cd "$FRONTEND_DIR" && npm run dev:h5 &
FRONTEND_PID=$!
echo "✅ 前端服务已启动 (PID: $FRONTEND_PID)"
echo ""

echo "================================"
echo "🎉 系统启动完成！"
echo ""
echo "📱 前端访问地址: http://localhost:8081"
echo "🔧 后端 API 地址: http://localhost:8080/api"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "================================"

wait $BACKEND_PID $FRONTEND_PID
