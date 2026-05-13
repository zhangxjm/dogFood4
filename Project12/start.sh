#!/bin/bash

echo "=========================================="
echo "   班级学生管理系统 - 启动脚本"
echo "=========================================="

echo ""
echo "检查 Docker 和 Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "错误: 未找到 Docker，请先安装 Docker Desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    if ! docker compose version &> /dev/null; then
        echo "错误: 未找到 Docker Compose"
        exit 1
    fi
fi

echo ""
echo "创建数据目录..."
mkdir -p data

echo ""
echo "构建并启动服务..."
if command -v docker-compose &> /dev/null; then
    docker-compose up --build -d
else
    docker compose up --build -d
fi

echo ""
echo "=========================================="
echo "   服务已启动！"
echo "=========================================="
echo ""
echo "前端地址: http://localhost:5173"
echo "后端地址: http://localhost:8000"
echo "API 文档: http://localhost:8000/docs"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo ""
