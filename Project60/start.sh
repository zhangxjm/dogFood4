#!/bin/bash

echo "🚀 开始启动少儿兴趣班管理系统..."
echo ""

# 停止并清理旧容器
echo "🧹 清理旧容器..."
docker compose down 2>/dev/null || true

echo ""
echo "📦 构建并启动Docker容器..."
echo "   - MySQL 8.0"
echo "   - Django Backend"
echo "   - Vue3 Frontend"
echo ""

docker compose up -d --build

echo ""
echo "⏳ 等待服务启动（约30-60秒）..."
echo ""

# 等待后端服务启动
max_wait=60
wait_time=0
backend_ready=0

while [ $wait_time -lt $max_wait ]; do
    if curl -s http://localhost:8000/health/ >/dev/null 2>&1 || \
       docker compose logs backend 2>/dev/null | grep -q "Starting development server"; then
        backend_ready=1
        break
    fi
    sleep 3
    wait_time=$((wait_time + 3))
    echo "   已等待 ${wait_time} 秒..."
done

echo ""
if [ $backend_ready -eq 1 ]; then
    echo "✅ 系统启动完成！"
else
    echo "⚠️  服务可能仍在启动中，请稍候再试"
fi

echo ""
echo "🌐 访问地址："
echo "   前端：http://localhost:5173"
echo "   后端API：http://localhost:8000"
echo "   Django Admin：http://localhost:8000/admin (admin/admin123)"
echo ""
echo "📚 核心功能："
echo "   ✅ 学员管理"
echo "   ✅ 课程管理"
echo "   ✅ 报名缴费"
echo "   ✅ 课时记录（自动扣减）"
echo "   ✅ 老师管理"
echo "   ✅ 班级统计"
echo ""
echo "📝 查看日志："
echo "   所有服务：docker compose logs -f"
echo "   仅后端：docker compose logs -f backend"
echo "   仅前端：docker compose logs -f frontend"
echo ""
echo "⏹️  停止服务：docker compose down"
