#!/bin/bash

echo "=== 企业员工考勤系统启动 ==="

echo ""
echo "1. 检查 MongoDB 是否运行..."
if ! docker ps --format "{{.Names}}" | grep -q "attendance-mongodb"; then
    echo "   启动 MongoDB 容器..."
    docker run -d --name attendance-mongodb -p 27017:27017 mongo:5.0
    sleep 5
else
    echo "   MongoDB 已在运行"
fi

echo ""
echo "2. 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "3. 编译后端..."
npm run build

echo ""
echo "4. 启动后端服务 (端口 3000)..."
npm run start:prod &
BACKEND_PID=$!
cd ..

sleep 10

echo ""
echo "5. 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "6. 启动前端服务 (端口 5173)..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "=== 服务启动完成 ==="
echo "后端 API: http://localhost:3000"
echo "前端地址: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; docker stop attendance-mongodb; exit" INT
wait
