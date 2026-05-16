#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

if [ ! -d "node_modules" ]; then
  echo "安装后端依赖..."
  npm install
fi

echo "启动后端服务..."
echo "后端服务地址: http://localhost:3001"

node src/app.js