@echo off
chcp 65001 >nul
echo ======================================
echo   仓库出入库管理系统 - 启动脚本
echo ======================================
echo.

echo 检查 Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装
    echo 请先安装 Docker: https://www.docker.com/get-started
    pause
    exit /b 1
)
echo [OK] Docker 已安装
echo.

echo 正在启动 MySQL 数据库...
cd docker
docker compose up -d mysql
cd ..
echo.
echo 等待 MySQL 准备就绪（约30秒）...
timeout /t 30 /nobreak >nul
echo [OK] MySQL 已启动
echo   地址: localhost:3306
echo   数据库: warehouse
echo   用户名: root
echo   密码: 123456
echo.

echo ======================================
echo   请选择启动方式:
echo ======================================
echo.
echo 1) Docker模式（推荐，一键启动全部）
echo 2) 仅启动MySQL（手动启动前后端）
echo.
set /p choice=请输入选项 (1-2): 

if "%choice%"=="1" (
    echo.
    echo 正在使用 Docker Compose 启动所有服务...
    docker compose up -d --build
    echo.
    echo 等待服务启动（约60秒）...
    timeout /t 60 /nobreak >nul
    echo.
    echo ======================================
    echo   系统启动完成！
    echo ======================================
    echo.
    echo 访问地址:
    echo   前端: http://localhost
    echo   后端API: http://localhost:8080
    echo.
    echo Docker容器状态:
    docker compose ps
    echo.
    echo 查看日志: docker compose logs -f
    echo 停止服务: docker compose down
    echo.
    pause
) else if "%choice%"=="2" (
    echo.
    echo ======================================
    echo   MySQL 已启动
    echo ======================================
    echo.
    echo 手动启动步骤:
    echo.
    echo 1. 启动后端:
    echo    cd backend
    echo    go mod tidy
    echo    go run main.go
    echo.
    echo 2. 启动前端:
    echo    cd frontend
    echo    npm install
    echo    npm run dev
    echo.
    echo 访问地址:
    echo   前端: http://localhost:3000
    echo   后端API: http://localhost:8080
    echo.
    echo 停止MySQL: cd docker ^&^& docker compose down
    echo.
    pause
) else (
    echo 无效选项
    pause
    exit /b 1
)
