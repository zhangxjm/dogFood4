#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"

echo "🚀 启动后端服务 (端口: 8080)"
echo "项目目录: $BACKEND_DIR"
echo ""

export GOPROXY=https://goproxy.cn,direct
export CGO_ENABLED=1

cd "$BACKEND_DIR"

echo "📦 检查并安装依赖..."
go mod tidy

echo ""
echo "🚀 启动 Gin 服务..."
go run main.go
