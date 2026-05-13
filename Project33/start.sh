#!/bin/bash

set -e

echo "=========================================="
echo "  理发店管理系统 - 启动中"
echo "=========================================="

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "检查Docker环境..."
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装Docker，请先安装Docker Desktop"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: 未安装Docker Compose"
    exit 1
fi

echo ""
echo "停止现有容器（如果存在）..."
if docker compose version &> /dev/null; then
    docker compose down 2>/dev/null || true
else
    docker-compose down 2>/dev/null || true
fi

echo ""
echo "构建并启动所有服务..."
if docker compose version &> /dev/null; then
    docker compose up -d --build
    COMPOSE_CMD="docker compose"
else
    docker-compose up -d --build
    COMPOSE_CMD="docker-compose"
fi

echo ""
echo "等待数据库启动..."
sleep 15

echo ""
echo "执行数据库迁移..."
$COMPOSE_CMD exec backend python manage.py migrate

echo ""
echo "=========================================="
echo "  启动完成！"
echo "=========================================="
echo ""
echo "访问地址："
echo "  前端页面: http://localhost:5173"
echo "  后端API:  http://localhost:8000/api/"
echo "  Django Admin: http://localhost:8000/admin/"
echo ""
echo "常用命令："
echo "  查看日志: $COMPOSE_CMD logs -f"
echo "  停止服务: $COMPOSE_CMD down"
echo "  重启服务: $COMPOSE_CMD restart"
echo ""
