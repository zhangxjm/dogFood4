#!/bin/bash

echo "=========================================="
echo "      健身房课程预约系统 - 一键启动"
echo "=========================================="

echo ""
echo "[1/3] 启动 MySQL 数据库..."
docker-compose up -d mysql

echo ""
echo "等待 MySQL 数据库初始化完成..."
sleep 15

echo ""
echo "[2/3] 构建并启动后端服务..."
docker-compose up -d --build backend

echo ""
echo "[3/3] 构建并启动前端服务..."
docker-compose up -d --build frontend

echo ""
echo "=========================================="
echo "              启动完成！"
echo "=========================================="
echo ""
echo "服务地址："
echo "  - 前端应用: http://localhost:5173"
echo "  - 后端API:  http://localhost:8080"
echo "  - MySQL:    localhost:3307"
echo ""
echo "默认测试会员："
echo "  - 张三 (手机号: 13800138001)"
echo "  - 李四 (手机号: 13800138002)"
echo "  - 王五 (手机号: 13800138003)"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo ""
