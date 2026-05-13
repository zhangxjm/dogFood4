@echo off
chcp 65001 >nul
setlocal

echo ==========================================
echo   外卖小店商家后台 - 项目启动
echo ==========================================
echo.

set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [1/4] 检查并安装后端依赖...
cd "%PROJECT_DIR%backend"
if not exist venv (
    echo 创建虚拟环境...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 后端依赖安装失败
    pause
    exit /b 1
)
echo [完成] 后端依赖已就绪
echo.

echo [2/4] 检查并安装前端依赖...
cd "%PROJECT_DIR%frontend"
if not exist node_modules (
    echo 安装前端依赖，这可能需要几分钟...
    call npm install
    if errorlevel 1 (
        echo [错误] 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo [完成] 前端依赖已就绪
echo.

echo ==========================================
echo   服务启动中...
echo ==========================================
echo.

echo [3/4] 启动后端服务 (端口: 8000)...
cd "%PROJECT_DIR%backend"
start "Backend" cmd /c "call venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [4/4] 启动前端服务 (端口: 5173)...
cd "%PROJECT_DIR%frontend"
start "Frontend" cmd /c "call npm run dev -- --host 0.0.0.0"

echo.
echo ==========================================
echo   服务启动完成！
echo ==========================================
echo.
echo 🌐 前端地址: http://localhost:5173
echo 🔧 后端地址: http://localhost:8000
echo 📚 API 文档: http://localhost:8000/docs
echo.
echo 注意：后端和前端已在新窗口中启动
echo 按任意键退出此脚本，服务将继续在后台运行
echo.
pause
