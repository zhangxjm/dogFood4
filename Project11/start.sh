#!/bin/bash

echo "========================================"
echo "充电桩监控平台启动脚本"
echo "========================================"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "[1/3] 检查 Docker 是否安装..."
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker Desktop"
    exit 1
fi

echo ""
echo "[2/3] 构建并启动所有服务..."
echo "这可能需要几分钟时间，请耐心等待..."
echo ""

docker compose up -d --build

echo ""
echo "[3/3] 等待所有服务就绪..."
echo "正在等待 MySQL 准备就绪..."

for i in {1..60}; do
    MYSQL_READY=$(docker inspect -f '{{.State.Health.Status}}' charging_mysql 2>/dev/null || echo "starting")
    REDIS_READY=$(docker inspect -f '{{.State.Health.Status}}' charging_redis 2>/dev/null || echo "starting")
    
    if [[ "$MYSQL_READY" == "healthy" && "$REDIS_READY" == "healthy" ]]; then
        echo "数据库已就绪！"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo "等待中... ($i/60)"
    fi
    sleep 2
done

echo ""
echo "正在等待后端服务启动..."
for i in {1..60}; do
    BACKEND_STATUS=$(docker inspect -f '{{.State.Running}}' charging_backend 2>/dev/null || echo "false")
    if [[ "$BACKEND_STATUS" == "true" ]]; then
        echo "后端服务已启动！"
        break
    fi
    sleep 2
done

echo ""
echo "========================================"
echo "系统启动完成！"
echo "========================================"
echo ""
echo "访问地址:"
echo "  前端监控大屏: http://localhost:5173"
echo "  后端API:      http://localhost:8080"
echo ""
echo "Docker 容器状态:"
docker compose ps
echo ""
echo "查看日志: docker compose logs -f [服务名]"
echo "停止服务: docker compose down"
echo "重启服务: docker compose restart"
echo ""
echo "按 Ctrl+C 退出此脚本（服务会继续运行）"
echo "========================================"

trap 'echo ""; echo "脚本已退出，服务仍在运行中..."; exit 0' SIGINT

while true; do
    sleep 1
done
