#!/bin/bash

echo "============================================="
echo "高校社团管理系统 - 启动脚本"
echo "============================================="

if ! command -v docker &> /dev/null; then
    echo "错误: 未检测到 Docker，请先安装 Docker Desktop"
    exit 1
fi

echo ""
echo "[1/4] 检查并启动 MySQL 容器..."
if [ ! "$(docker ps -q -f name=club_management_mysql)" ]; then
    if [ "$(docker ps -aq -f status=exited -f name=club_management_mysql)" ]; then
        echo "正在启动已存在的 MySQL 容器..."
        docker start club_management_mysql
    else
        echo "正在创建并启动 MySQL 容器..."
        docker-compose up -d mysql
    fi
else
    echo "MySQL 容器已在运行中"
fi

echo ""
echo "[2/4] 等待 MySQL 就绪..."
for i in {1..30}; do
    if docker exec club_management_mysql mysqladmin ping -h localhost -u club_user -pclub_password --silent 2>/dev/null; then
        echo "MySQL 已就绪"
        break
    fi
    echo "等待中... ($i/30)"
    sleep 2
done

echo ""
echo "[3/4] 检查 Python 依赖..."
if [ ! -d "venv" ]; then
    echo "正在创建虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "正在安装/更新依赖..."
pip install -r requirements.txt -q

echo ""
echo "[4/4] 启动 Flask 应用..."
echo ""
echo "============================================="
echo "系统启动成功！"
echo "访问地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务"
echo "============================================="
echo ""

python run.py
