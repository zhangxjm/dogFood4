#!/bin/bash

echo "正在启动MySQL服务..."
docker-compose up -d mysql

echo "等待MySQL就绪..."
sleep 15

echo "安装Python依赖..."
pip install -r requirements.txt

echo "应用数据库迁移..."
python manage.py makemigrations
python manage.py migrate

echo "启动Django服务..."
python manage.py runserver 0.0.0.0:8000
