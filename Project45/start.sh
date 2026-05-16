#!/bin/bash

echo "======================================"
echo "  仓库出入库管理系统 - 启动脚本"
echo "======================================"
echo ""

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "错误: Docker 未安装"
        echo "请先安装 Docker: https://www.docker.com/get-started"
        exit 1
    fi
    if ! command -v docker compose &> /dev/null; then
        if ! docker compose version &> /dev/null; then
            echo "错误: Docker Compose 未安装"
            exit 1
        fi
    fi
    echo "✓ Docker 已安装"
}

start_mysql() {
    echo ""
    echo "正在启动 MySQL 数据库..."
    cd docker
    docker compose up -d mysql
    echo ""
    echo "等待 MySQL 准备就绪（约30秒）..."
    sleep 30
    cd ..
    echo "✓ MySQL 已启动"
    echo "  地址: localhost:3306"
    echo "  数据库: warehouse"
    echo "  用户名: root"
    echo "  密码: 123456"
}

check_go() {
    if ! command -v go &> /dev/null; then
        echo "错误: Go 未安装"
        echo "请先安装 Go: https://golang.org/dl/"
        exit 1
    fi
    echo "✓ Go 已安装: $(go version)"
}

check_node() {
    if ! command -v node &> /dev/null; then
        echo "错误: Node.js 未安装"
        echo "请先安装 Node.js: https://nodejs.org/"
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        echo "错误: npm 未安装"
        exit 1
    fi
    echo "✓ Node.js 已安装: $(node -v)"
    echo "✓ npm 已安装: $(npm -v)"
}

install_backend_deps() {
    echo ""
    echo "正在安装后端依赖..."
    cd backend
    go mod tidy
    cd ..
    echo "✓ 后端依赖安装完成"
}

install_frontend_deps() {
    echo ""
    echo "正在安装前端依赖..."
    cd frontend
    npm install
    cd ..
    echo "✓ 前端依赖安装完成"
}

start_backend() {
    echo ""
    echo "正在启动后端服务..."
    cd backend
    go run main.go &
    BACKEND_PID=$!
    cd ..
    sleep 5
    echo "✓ 后端服务已启动"
    echo "  地址: http://localhost:8080"
    echo "  PID: $BACKEND_PID"
}

start_frontend() {
    echo ""
    echo "正在启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    sleep 3
    echo "✓ 前端服务已启动"
    echo "  地址: http://localhost:3000"
    echo "  PID: $FRONTEND_PID"
}

show_complete() {
    echo ""
    echo "======================================"
    echo "  系统启动完成！"
    echo "======================================"
    echo ""
    echo "访问地址:"
    echo "  前端: http://localhost:3000"
    echo "  后端API: http://localhost:8080"
    echo ""
    echo "按 Ctrl+C 停止服务"
    wait
}

echo ""
echo "检查环境..."
check_docker

echo ""
echo "请选择启动方式:"
echo "1) 开发模式（本地启动，需要Go和Node.js）"
echo "2) Docker模式（一键启动全部）"
read -p "请输入选项 (1-2): " choice

case $choice in
    1)
        check_go
        check_node
        start_mysql
        install_backend_deps
        install_frontend_deps
        start_backend
        start_frontend
        show_complete
        ;;
    2)
        echo ""
        echo "正在使用 Docker Compose 启动所有服务..."
        docker compose up -d --build
        echo ""
        echo "等待服务启动（约60秒）..."
        sleep 60
        echo ""
        echo "======================================"
        echo "  系统启动完成！"
        echo "======================================"
        echo ""
        echo "访问地址:"
        echo "  前端: http://localhost"
        echo "  后端API: http://localhost:8080"
        echo ""
        echo "Docker容器状态:"
        docker compose ps
        echo ""
        echo "查看日志: docker compose logs -f"
        echo "停止服务: docker compose down"
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac
