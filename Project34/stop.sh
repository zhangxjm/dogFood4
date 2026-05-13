#!/bin/bash

echo "🛑 正在停止服务..."

# 读取 PID 文件
if [ -f "backend.pid" ]; then
    BACKEND_PID=$(cat backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID
        echo "✅ 后端服务已停止 (PID: $BACKEND_PID)"
    else
        echo "⚠️  后端服务已不在运行"
    fi
    rm -f backend.pid
fi

if [ -f "frontend.pid" ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID
        echo "✅ 前端服务已停止 (PID: $FRONTEND_PID)"
    else
        echo "⚠️  前端服务已不在运行"
    fi
    rm -f frontend.pid
fi

# 清理可能残留的进程
pkill -f "spring-boot:run" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo ""
echo "🎉 所有服务已停止"
