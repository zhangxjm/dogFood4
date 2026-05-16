#!/bin/bash

echo "=== CRM客户关系管理系统启动脚本 ==="
echo ""

# 检查是否有Docker Compose
if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    echo "检测到Docker，使用Docker Compose启动..."
    echo "启动后访问: http://localhost:3000"
    echo ""
    docker-compose up -d
    exit 0
fi

echo "Docker未检测到，使用本地模式启动..."
echo ""

# 启动后端
echo "启动后端服务 (端口: 8080)..."
cd crm-backend
mvn spring-boot:run &
BACKEND_PID=$!

# 等待后端启动
sleep 10

# 启动前端
echo ""
echo "启动前端服务 (端口: 3000)..."
cd ../crm-frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== 服务启动中 ==="
echo "后端: http://localhost:8080"
echo "前端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap "echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
