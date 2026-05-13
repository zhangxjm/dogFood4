#!/bin/bash

echo "🚀 正在启动学习计划打卡系统..."

echo "📦 拉取 Docker 镜像（如果需要）..."
docker compose pull

echo "🔨 构建并启动所有服务..."
docker compose up -d --build

echo "⏳ 等待服务启动..."
sleep 15

echo "✅ 服务启动完成！"
echo ""
echo "📋 服务信息："
echo "   - 前端: http://localhost:5173"
echo "   - 后端 API: http://localhost:8000"
echo "   - API 文档: http://localhost:8000/docs"
echo "   - MySQL: localhost:3306"
echo ""
echo "📖 使用说明："
echo "   1. 打开浏览器访问 http://localhost:5173"
echo "   2. 点击 '学习计划' 标签页创建你的第一个计划"
echo "   3. 点击 '打卡' 标签页进行每日打卡"
echo "   4. 点击 '日历' 标签页查看打卡记录"
echo ""
echo "🔧 常用命令："
echo "   查看日志: docker compose logs -f"
echo "   停止服务: docker compose down"
echo "   重启服务: docker compose restart"
