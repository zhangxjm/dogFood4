#!/bin/bash

echo "=== 驾校学员管理系统 ==="

echo "1. 启动MySQL容器..."
docker compose up -d mysql

echo "2. 等待MySQL就绪..."
sleep 20

echo "3. 启动后端和前端..."
docker compose up -d backend frontend

echo "4. 服务启动完成！"
echo "   - 前端地址: http://localhost:3000"
echo "   - 后端地址: http://localhost:8080"
echo "   - MySQL地址: localhost:3306"
echo ""
echo "查看日志命令: docker compose logs -f"
echo "停止服务命令: docker compose down"
