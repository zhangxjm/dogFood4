#!/bin/bash

echo "🛑 正在停止学习计划打卡系统..."
docker compose down

echo "✅ 服务已停止"
echo ""
echo "💡 如果需要保留数据，下次直接运行 ./start.sh 即可"
echo "💡 如果需要清除所有数据（包括数据库），运行: docker compose down -v"
