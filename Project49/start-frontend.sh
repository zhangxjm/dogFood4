#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "📦 安装前端依赖..."
  npm install
fi

echo "🚀 启动前端服务..."
echo "📱 前端服务地址: http://localhost:5173"

npm run dev