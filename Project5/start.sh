#!/bin/bash

echo "========================================="
echo "校园二手闲置交易平台 - 启动脚本"
echo "========================================="

echo ""
echo "检查 Docker 是否安装..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

echo "✅ Docker 已安装"

echo ""
echo "检查 Docker Compose 是否安装..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo "✅ Docker Compose 已安装"

echo ""
echo "构建并启动服务..."

if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

echo ""
echo "========================================="
echo "服务启动完成！"
echo "========================================="
echo ""
echo "后端 API:  http://localhost:8000"
echo "API 文档:   http://localhost:8000/docs"
echo "前端页面:  http://localhost:5173"
echo ""
echo "默认测试账号:"
echo "  用户名: student1  密码: 123456"
echo "  用户名: student2  密码: 123456"
echo "  用户名: admin     密码: 123456"
echo ""
echo "查看日志: docker compose logs -f"
echo "停止服务: docker compose down"
echo "========================================="
