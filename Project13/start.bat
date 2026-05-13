@echo off
echo ==========================================
echo 社区小超市库存管理系统启动脚本
echo ==========================================

echo.
echo 步骤 1/4: 启动 MySQL 数据库 (Docker)...
docker-compose up -d mysql

echo.
echo 等待 MySQL 启动 (约 15 秒)...
timeout /t 15 /nobreak

echo.
echo 步骤 2/4: 编译并启动 SpringBoot 后端...
call mvn clean package -DskipTests
start "后端服务" java -jar target\inventory-management-1.0.0.jar

echo.
echo 等待后端服务启动 (约 10 秒)...
timeout /t 10 /nobreak

echo.
echo 步骤 3/4: 安装前端依赖...
cd frontend
call npm install

echo.
echo 步骤 4/4: 启动前端服务...
start "前端服务" npm run dev

echo.
echo ==========================================
echo 系统启动完成！
echo ==========================================
echo.
echo 访问地址：
echo   前端页面: http://localhost:3000
echo   后端 API: http://localhost:8080
echo.
echo 数据库信息：
echo   数据库: supermarket
echo   用户名: root
echo   密码: root123456
echo.
pause
