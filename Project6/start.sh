#!/bin/bash

echo "=========================================="
echo "  ERP进销存管理系统 - 启动脚本"
echo "  Java SpringCloud 微服务架构"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查Docker是否运行
check_docker() {
    echo -e "${YELLOW}[1/7] 检查Docker环境...${NC}"
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: Docker 未安装${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}错误: Docker 未运行，请先启动Docker${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Docker 环境正常${NC}"
}

# 启动Docker容器
start_docker() {
    echo -e "${YELLOW}[2/7] 启动MySQL和Redis容器...${NC}"
    if [ -f "docker-compose.yml" ]; then
        docker-compose up -d
        echo -e "${GREEN}✓ Docker容器启动中...${NC}"
        echo -e "${YELLOW}等待MySQL初始化（约30秒）...${NC}"
        sleep 30
    else
        echo -e "${RED}错误: docker-compose.yml 不存在${NC}"
        exit 1
    fi
}

# 检查Java环境
check_java() {
    echo -e "${YELLOW}[3/7] 检查Java环境...${NC}"
    if ! command -v java &> /dev/null; then
        echo -e "${RED}错误: Java 未安装${NC}"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    echo -e "${GREEN}✓ Java 版本: $JAVA_VERSION${NC}"
}

# 检查Maven环境
check_maven() {
    echo -e "${YELLOW}[4/7] 检查Maven环境...${NC}"
    if ! command -v mvn &> /dev/null; then
        echo -e "${RED}错误: Maven 未安装${NC}"
        exit 1
    fi
    
    MAVEN_VERSION=$(mvn -version | head -n 1)
    echo -e "${GREEN}✓ $MAVEN_VERSION${NC}"
}

# 编译项目
build_project() {
    echo -e "${YELLOW}[5/7] 编译后端项目...${NC}"
    if [ -f "pom.xml" ]; then
        mvn clean install -DskipTests
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ 后端项目编译成功${NC}"
        else
            echo -e "${RED}错误: 后端项目编译失败${NC}"
            exit 1
        fi
    else
        echo -e "${RED}错误: pom.xml 不存在${NC}"
        exit 1
    fi
}

# 启动后端服务
start_backend() {
    echo -e "${YELLOW}[6/7] 启动后端微服务...${NC}"
    echo ""
    
    # 服务列表及其端口
    declare -A services=(
        ["erp-eureka"]="8761"
        ["erp-config"]="8888"
        ["erp-gateway"]="9999"
        ["erp-product"]="8001"
        ["erp-purchase"]="8002"
        ["erp-sales"]="8003"
        ["erp-inventory"]="8004"
        ["erp-finance"]="8005"
    )
    
    # 按顺序启动服务
    startup_order=("erp-eureka" "erp-config" "erp-gateway" "erp-product" "erp-purchase" "erp-sales" "erp-inventory" "erp-finance")
    
    for service in "${startup_order[@]}"; do
        port=${services[$service]}
        echo -e "正在启动 $service (端口: $port)..."
        
        # 检查端口是否被占用
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠ 端口 $port 已被占用，跳过 $service${NC}"
            continue
        fi
        
        # 启动服务
        nohup java -jar $service/target/$service-1.0.0.jar > logs/$service.log 2>&1 &
        
        # 等待服务启动
        if [ "$service" = "erp-eureka" ] || [ "$service" = "erp-config" ]; then
            sleep 15
        else
            sleep 10
        fi
        
        # 检查服务是否启动成功
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✓ $service 启动成功${NC}"
        else
            echo -e "${RED}✗ $service 启动失败，请查看 logs/$service.log${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✓ 后端微服务启动完成${NC}"
}

# 启动前端
start_frontend() {
    echo -e "${YELLOW}[7/7] 启动前端项目...${NC}"
    
    if [ -d "erp-web" ]; then
        cd erp-web
        
        # 检查node_modules
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}正在安装前端依赖...${NC}"
            npm install
        fi
        
        # 启动前端
        nohup npm run dev > ../logs/frontend.log 2>&1 &
        sleep 5
        
        cd ..
        echo -e "${GREEN}✓ 前端项目启动中...${NC}"
    else
        echo -e "${RED}错误: erp-web 目录不存在${NC}"
    fi
}

# 主函数
main() {
    # 创建日志目录
    mkdir -p logs
    
    # 执行各个步骤
    check_docker
    start_docker
    check_java
    check_maven
    build_project
    start_backend
    start_frontend
    
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✓ 系统启动完成!${NC}"
    echo "=========================================="
    echo ""
    echo "服务访问地址:"
    echo "  前端页面:    http://localhost:3000"
    echo "  Eureka注册中心: http://localhost:8761"
    echo "  配置中心:    http://localhost:8888"
    echo "  API网关:     http://localhost:9999"
    echo "  phpMyAdmin:  http://localhost:8088 (root/123456)"
    echo ""
    echo "服务端口:"
    echo "  商品服务: 8001"
    echo "  采购服务: 8002"
    echo "  销售服务: 8003"
    echo "  库存服务: 8004"
    echo "  财务服务: 8005"
    echo ""
    echo "日志文件: ./logs/"
    echo ""
}

# 执行主函数
main