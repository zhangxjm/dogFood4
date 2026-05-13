#!/bin/bash

echo "========================================="
echo "校园二手闲置交易平台 - 开发模式启动"
echo "========================================="

echo ""
echo "启动后端服务..."
cd backend

echo "检查 Python 虚拟环境..."
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install -r requirements.txt -q

echo "启动 FastAPI 服务..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo ""
echo "启动前端服务..."
cd ../frontend

echo "安装依赖..."
npm install --silent

echo "启动 Vite 开发服务器..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================="
echo "开发服务启动完成！"
echo "========================================="
echo ""
echo "后端 API:  http://localhost:8000"
echo "API 文档:   http://localhost:8000/docs"
echo "前端页面:  http://localhost:5173"
echo ""
echo "默认测试账号:"
echo "  用户名: student1  密码: 123456"
echo "  用户名: student2  密码: 123456"
echo ""
echo "按 Ctrl+C 停止服务"
echo "========================================="

trap "kill $BACKEND_PID $FRONTEND_PID; exit 0" INT
wait
