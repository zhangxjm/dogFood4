#!/bin/bash

echo "=================================="
echo "校园二手市场项目启动脚本"
echo "=================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "项目根目录: $ROOT_DIR"
echo ""

echo "检查 Python 是否已安装..."
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python3，请先安装 Python 3.8+"
    exit 1
fi
echo "Python 版本: $(python3 --version)"
echo ""

echo "检查 Node.js 是否已安装..."
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 16+"
    exit 1
fi
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo ""

echo "=================================="
echo "安装后端依赖..."
echo "=================================="
cd "$BACKEND_DIR"

if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "=================================="
echo "安装前端依赖..."
echo "=================================="
cd "$FRONTEND_DIR"
npm install

echo ""
echo "=================================="
echo "启动项目..."
echo "=================================="

echo "启动 Flask 后端 (端口 5000)..."
cd "$BACKEND_DIR"
source venv/bin/activate
python app.py &
BACKEND_PID=$!
echo "后端服务 PID: $BACKEND_PID"

sleep 3

echo ""
echo "启动 Vue 前端 (端口 3000)..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo "前端服务 PID: $FRONTEND_PID"

echo ""
echo "=================================="
echo "项目已启动！"
echo "=================================="
echo "后端 API: http://localhost:5000"
echo "前端页面: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "=================================="

trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '服务已停止'; exit 0" INT

wait
