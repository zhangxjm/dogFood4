#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 启动前端服务 (端口: 8081)"
echo "项目目录: $FRONTEND_DIR"
echo ""

cd "$FRONTEND_DIR"

echo "📦 检查并安装依赖..."
npm install

echo ""
echo "🚀 启动 Uniapp 开发服务器..."
npm run dev:h5
