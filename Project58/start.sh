#!/bin/bash

echo "=== 办公用品管理系统启动脚本 ==="

echo ""
echo "1. 启动 Docker 服务（MySQL + Redis）..."
docker-compose up -d

echo ""
echo "等待 MySQL 启动..."
sleep 10

echo ""
echo "2. 安装后端依赖..."
cd backend
go mod tidy

echo ""
echo "3. 启动后端服务 (端口 3001)..."
gnome-terminal --title="Backend Server" -- bash -c "cd $(pwd); go run main.go; exec bash" &
cd ..

echo ""
echo "4. 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo ""
echo "5. 启动前端服务 (端口 3000)..."
gnome-terminal --title="Frontend Server" -- bash -c "cd $(pwd); npm run dev; exec bash" &
cd ..

echo ""
echo "=== 服务启动完成！ ==="
echo ""
echo "后端服务: http://localhost:3001"
echo "前端服务: http://localhost:3000"
echo ""
echo "测试账号:"
echo "  管理员: admin / 123456"
echo "  经理:   manager / 123456"
echo "  员工:   employee / 123456"
echo ""
echo "按 Ctrl+C 可以停止此脚本，但服务将继续在终端中运行"
