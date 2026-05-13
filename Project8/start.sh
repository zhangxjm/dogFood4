#!/bin/bash

echo "=================================="
echo "扫码点餐系统 - 一键启动脚本"
echo "=================================="

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BASE_DIR"

check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "错误: 未找到命令 $1，请先安装"
        exit 1
    fi
}

check_command docker
check_command docker-compose
check_command java
check_command mvn
check_command node
check_command npm

echo "[1/4] 启动 MySQL 数据库..."
docker-compose up -d mysql

echo "等待数据库启动..."
sleep 15

echo "[2/4] 构建后端项目..."
cd "$BASE_DIR/backend"
mvn clean package -DskipTests -q

echo "[3/4] 安装前端依赖..."
cd "$BASE_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install --registry https://registry.npmmirror.com
fi

echo ""
echo "=================================="
echo "服务启动说明"
echo "=================================="
echo ""
echo "1. 启动后端服务 (端口 8080):"
echo "   cd backend && mvn spring-boot:run"
echo ""
echo "2. 启动前端服务 (端口 5173):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. 访问地址:"
echo "   - 管理端/二维码: http://localhost:5173/#/admin"
echo "   - 店员端: http://localhost:5173/#/staff"
echo "   - 后厨系统: http://localhost:5173/#/kitchen"
echo "   - 顾客点餐: http://localhost:5173/#/menu?tableNo=A01"
echo ""
echo "4. 数据库信息:"
echo "   - 端口: 3306"
echo "   - 库名: foodorder"
echo "   - 账号: foodorder / foodorder123"
echo ""
echo "=================================="
