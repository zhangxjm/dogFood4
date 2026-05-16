#!/bin/bash

echo "========================================"
echo "  个人博客系统 - 启动脚本"
echo "========================================"

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未检测到Docker，请先安装Docker"
    exit 1
fi

# 检查docker-compose是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: 未检测到Docker Compose，请先安装"
    exit 1
fi

# 使用兼容的compose命令
COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker compose"
fi

echo ""
echo "停止并清理旧容器..."
$COMPOSE_CMD down -v

echo ""
echo "重新构建并启动所有服务..."
$COMPOSE_CMD up -d --build

echo ""
echo "等待服务启动..."
sleep 30

echo ""
echo "========================================"
echo "  服务启动完成！"
echo "========================================"
echo ""
echo "访问地址:"
echo "  前端首页: http://localhost:3000"
echo "  后端API:  http://localhost:8000"
echo "  管理后台: http://localhost:3000/admin"
echo ""
echo "默认管理员账号:"
echo "  用户名: admin"
echo "  密码:   admin123456"
echo ""
echo "查看日志命令: docker-compose logs -f"
echo "停止服务命令: docker-compose down"
echo ""
echo "查看后端日志: docker-compose logs -f backend"
echo ""
