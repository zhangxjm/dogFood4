#!/bin/bash

echo "🌍 旅游攻略分享平台启动中..."

# 检查是否安装了依赖
if [ ! -d "backend/app/uploads" ]; then
    mkdir -p backend/app/uploads
fi

# 启动后端
echo "🔧 启动后端服务 (端口 5000)..."
cd backend
python3 run.py &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务 (端口 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动成功！"
echo "   后端 API：http://localhost:5000"
echo "   前端页面：http://localhost:3000"
echo ""
echo "💡 按 Ctrl+C 停止服务"

# 等待用户中断
trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
