#!/bin/bash

echo "=========================================="
echo "  ERP进销存管理系统 - 停止脚本"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 停止后端服务
echo -e "${YELLOW}停止后端微服务...${NC}"

SERVICES=("erp-eureka" "erp-config" "erp-gateway" "erp-product" "erp-purchase" "erp-sales" "erp-inventory" "erp-finance")

for service in "${SERVICES[@]}"; do
    PIDS=$(lsof -t -c java 2>/dev/null | xargs -I {} ps -p {} -o pid=,comm= 2>/dev/null | grep "$service" | awk '{print $1}')
    
    if [ -n "$PIDS" ]; then
        echo -e "正在停止 $service..."
        kill -9 $PIDS 2>/dev/null
        echo -e "${GREEN}✓ $service 已停止${NC}"
    else
        echo -e "${YELLOW}⚠ $service 未运行${NC}"
    fi
done

# 停止前端
echo ""
echo -e "${YELLOW}停止前端服务...${NC}"
FRONTEND_PIDS=$(lsof -t -i :3000 2>/dev/null)
if [ -n "$FRONTEND_PIDS" ]; then
    kill -9 $FRONTEND_PIDS 2>/dev/null
    echo -e "${GREEN}✓ 前端服务已停止${NC}"
else
    echo -e "${YELLOW}⚠ 前端服务未运行${NC}"
fi

# 停止Docker容器（可选）
echo ""
read -p "是否停止Docker容器？(y/N): " stop_docker
if [[ "$stop_docker" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}停止Docker容器...${NC}"
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
        echo -e "${GREEN}✓ Docker容器已停止${NC}"
    fi
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✓ 系统停止完成!${NC}"
echo "=========================================="
echo ""