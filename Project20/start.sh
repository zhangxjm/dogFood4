#!/bin/bash

echo "===================================="
echo "  奶茶店点单系统 - 项目启动脚本"
echo "===================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "[1/5] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 20.x 版本"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  当前 Node.js 版本较低，建议使用 Node.js 20.x"
fi
echo "✅ Node.js 版本: $(node -v)"
echo ""

echo "[2/5] 检查 npm 环境..."
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi
echo "✅ npm 版本: $(npm -v)"
echo ""

echo "[3/5] 安装后端依赖..."
cd "$PROJECT_DIR/backend"
echo "   正在安装依赖，请稍候..."
if npm install; then
    echo "✅ 后端依赖安装成功"
else
    echo "❌ 后端依赖安装失败"
    exit 1
fi
echo ""

echo "[4/5] 安装前端依赖..."
cd "$PROJECT_DIR/frontend"
echo "   正在安装依赖，请稍候..."
if npm install; then
    echo "✅ 前端依赖安装成功"
else
    echo "❌ 前端依赖安装失败"
    exit 1
fi
echo ""

echo "[5/5] 启动服务..."
echo ""
echo "===================================="
echo "  启动方式："
echo ""
echo "  方式一：分别启动（推荐开发使用）"
echo "    后端: cd backend && npm start"
echo "    前端: cd frontend && npm run dev"
echo ""
echo "  方式二：Docker 启动"
echo "    docker-compose up -d"
echo ""
echo "  访问地址："
echo "    后端API: http://localhost:3000"
echo "    前端页面: http://localhost:5173 (开发模式)"
echo "              http://localhost:8080 (Docker模式)"
echo "===================================="
echo ""
echo "🎉 项目初始化完成！"
echo ""
