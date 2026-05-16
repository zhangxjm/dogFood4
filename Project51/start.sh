#!/bin/bash

echo "=================================="
echo "医院挂号系统 - 启动脚本"
echo "=================================="

echo ""
echo "正在启动Docker容器..."
echo ""

docker compose up -d --build

echo ""
echo "等待服务启动..."
sleep 10

echo ""
echo "=================================="
echo "服务启动完成！"
echo "=================================="
echo ""
echo "前端地址: http://localhost"
echo "后端地址: http://localhost:8080"
echo "MySQL: localhost:3306"
echo ""
echo "默认数据库密码: 123456"
echo ""
echo "查看日志: docker compose logs -f"
echo "停止服务: docker compose down"
echo ""
