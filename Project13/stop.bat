@echo off
echo 停止所有服务...

echo 停止 Docker MySQL 容器...
docker-compose down

echo 停止 Java 和 Node.js 进程...
taskkill /F /IM java.exe
taskkill /F /IM node.exe

echo 所有服务已停止
pause
