#!/bin/bash

echo "🔍 Docker 诊断工具"
echo ""

echo "📊 容器状态："
docker compose ps
echo ""

echo "📝 后端日志（最近20行）："
docker compose logs --tail=20 backend
echo ""

echo "📝 MySQL日志（最近20行）："
docker compose logs --tail=20 mysql
echo ""

echo "🔌 端口占用检查："
if lsof -Pi :3306 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ 3306 (MySQL) 已被占用"
else
    echo "   ❌ 3306 (MySQL) 未被占用"
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ 8000 (Backend) 已被占用"
else
    echo "   ❌ 8000 (Backend) 未被占用"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ✅ 5173 (Frontend) 已被占用"
else
    echo "   ❌ 5173 (Frontend) 未被占用"
fi
echo ""

echo "💡 常见问题解决："
echo "   1. 端口被占用？运行：docker compose down 后重新启动"
echo "   2. 一直卡在 Building？检查网络或使用国内Docker镜像源"
echo "   3. 数据库连接失败？等待约30秒MySQL完全启动后重试"
echo "   4. 查看实时日志：docker compose logs -f"
