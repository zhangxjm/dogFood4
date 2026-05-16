#!/bin/bash

echo "========================================"
echo "  数据库初始化"
echo "========================================"

# 等待数据库就绪
echo "等待MySQL数据库..."
until python -c "import pymysql; pymysql.connect(host='mysql', user='blog_user', password='blog123456', db='blog_db')" 2>/dev/null; do
    echo "数据库还未就绪，等待中..."
    sleep 3
done
echo "数据库连接成功！"

# 生成迁移文件
echo "生成数据库迁移文件..."
python manage.py makemigrations blog
if [ $? -ne 0 ]; then
    echo "makemigrations 失败！"
    exit 1
fi

# 执行迁移
echo "执行数据库迁移..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "migrate 失败！"
    exit 1
fi

# 创建超级用户
echo "检查并创建超级用户..."
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'blog_project.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123456')
    print('超级用户创建成功！')
else:
    print('超级用户已存在。')
"

echo ""
echo "========================================"
echo "  数据库初始化完成！"
echo "========================================"
echo ""
echo "启动Django服务器..."
exec python manage.py runserver 0.0.0.0:8000
