#!/bin/bash

echo "停止所有服务..."

echo "停止 Docker MySQL 容器..."
docker-compose down

echo "停止 Java 进程..."
pkill -f "inventory-management-1.0.0.jar"

echo "停止前端服务..."
pkill -f "node server.js"

echo "所有服务已停止"
