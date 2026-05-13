@echo off
chcp 65001 >nul

echo ==========================================
echo   ERP进销存管理系统 - 停止脚本 (Windows)
echo ==========================================
echo.

REM 停止后端服务
echo 停止后端微服务...

set "SERVICES=erp-eureka erp-config erp-gateway erp-product erp-purchase erp-sales erp-inventory erp-finance"

for %%S in (%SERVICES%) do (
    for /f "tokens=5" %%P in ('netstat -ano ^| findstr "LISTENING" ^| findstr "%%S"') do (
        echo 正在停止 %%S...
        taskkill /F /PID %%P >nul 2>&1
    )
)

echo [成功] 后端微服务已停止
echo.

REM 停止前端
echo 停止前端服务...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":3000"') do (
    taskkill /F /PID %%P >nul 2>&1
)
echo [成功] 前端服务已停止
echo.

REM 停止Docker容器
set /p STOP_DOCKER=是否停止Docker容器？(y/N): 
if /i "%STOP_DOCKER%"=="y" (
    echo 停止Docker容器...
    if exist docker-compose.yml (
        docker-compose down
        echo [成功] Docker容器已停止
    )
)

echo.
echo ==========================================
echo [成功] 系统停止完成!
echo ==========================================
echo.
pause