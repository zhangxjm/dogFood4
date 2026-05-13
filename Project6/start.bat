@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ==========================================
echo   ERP进销存管理系统 - 启动脚本 (Windows)
echo   Java SpringCloud 微服务架构
echo ==========================================
echo.

REM 创建日志目录
if not exist logs mkdir logs

REM 检查Docker
echo [1/7] 检查Docker环境...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Docker 未安装或未运行
    pause
    exit /b 1
)
echo [成功] Docker 环境正常
echo.

REM 启动Docker容器
echo [2/7] 启动MySQL和Redis容器...
if exist docker-compose.yml (
    docker-compose up -d
    echo [成功] Docker容器启动中...
    echo 等待MySQL初始化（约30秒）...
    timeout /t 30 /nobreak >nul
) else (
    echo [错误] docker-compose.yml 不存在
    pause
    exit /b 1
)
echo.

REM 检查Java
echo [3/7] 检查Java环境...
java -version >nul 2>&1
if errorlevel 1 (
    echo [错误] Java 未安装
    pause
    exit /b 1
)
echo [成功] Java 环境正常
echo.

REM 检查Maven
echo [4/7] 检查Maven环境...
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [错误] Maven 未安装
    pause
    exit /b 1
)
echo [成功] Maven 环境正常
echo.

REM 编译项目
echo [5/7] 编译后端项目...
if exist pom.xml (
    call mvn clean install -DskipTests
    if errorlevel 1 (
        echo [错误] 后端项目编译失败
        pause
        exit /b 1
    )
    echo [成功] 后端项目编译成功
) else (
    echo [错误] pom.xml 不存在
    pause
    exit /b 1
)
echo.

REM 启动后端服务
echo [6/7] 启动后端微服务...
echo.

set "SERVICES=erp-eureka:8761 erp-config:8888 erp-gateway:9999 erp-product:8001 erp-purchase:8002 erp-sales:8003 erp-inventory:8004 erp-finance:8005"

for %%A in (%SERVICES%) do (
    for /f "tokens=1,2 delims=:" %%B in ("%%A") do (
        set "SERVICE=%%B"
        set "PORT=%%C"
        
        echo 正在启动 !SERVICE! (端口: !PORT!)...
        
        REM 检查端口
        netstat -ano | findstr :!PORT! >nul
        if not errorlevel 1 (
            echo [警告] 端口 !PORT! 已被占用，跳过 !SERVICE!
            continue
        )
        
        REM 启动服务
        start "!SERVICE!" /min cmd /c "java -jar !SERVICE!/target/!SERVICE!-1.0.0.jar > logs/!SERVICE!.log 2>&1"
        
        REM 等待
        if "!SERVICE!"=="erp-eureka" (
            timeout /t 15 /nobreak >nul
        ) else if "!SERVICE!"=="erp-config" (
            timeout /t 15 /nobreak >nul
        ) else (
            timeout /t 10 /nobreak >nul
        )
        
        REM 检查是否启动成功
        netstat -ano | findstr :!PORT! >nul
        if errorlevel 1 (
            echo [失败] !SERVICE! 启动失败，请查看 logs/!SERVICE!.log
        ) else (
            echo [成功] !SERVICE! 启动成功
        )
    )
)

echo [成功] 后端微服务启动完成
echo.

REM 启动前端
echo [7/7] 启动前端项目...
if exist erp-web (
    cd erp-web
    
    if not exist node_modules (
        echo 正在安装前端依赖...
        call npm install
    )
    
    start "erp-web-frontend" /min cmd /c "npm run dev > ../logs/frontend.log 2>&1"
    timeout /t 5 /nobreak >nul
    
    cd ..
    echo [成功] 前端项目启动中...
) else (
    echo [错误] erp-web 目录不存在
)
echo.

echo ==========================================
echo [成功] 系统启动完成!
echo ==========================================
echo.
echo 服务访问地址:
echo   前端页面:    http://localhost:3000
echo   Eureka注册中心: http://localhost:8761
echo   配置中心:    http://localhost:8888
echo   API网关:     http://localhost:9999
echo   phpMyAdmin:  http://localhost:8088 (root/123456)
echo.
echo 服务端口:
echo   商品服务: 8001
echo   采购服务: 8002
echo   销售服务: 8003
echo   库存服务: 8004
echo   财务服务: 8005
echo.
echo 日志文件: .\logs\
echo.
pause