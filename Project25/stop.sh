#!/bin/bash

echo "正在停止高校社团管理系统..."

echo "停止 MySQL 容器..."
docker stop club_management_mysql 2>/dev/null

echo "系统已停止"
