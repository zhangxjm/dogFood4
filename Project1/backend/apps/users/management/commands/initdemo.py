from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import LeaderProfile
from apps.products.models import Category, Product
from apps.pickup_points.models import PickupPoint
from apps.groups.models import GroupBuy
from datetime import datetime, timedelta

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize demo data for the project'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== 开始初始化数据 ==='))
        
        self.stdout.write('\n1. 创建超级管理员...')
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123456'
            )
            admin.role = 'admin'
            admin.save()
            self.stdout.write('   管理员账号: admin / admin123456')
        else:
            self.stdout.write('   管理员已存在')
        
        self.stdout.write('\n2. 创建团长账号...')
        if not User.objects.filter(username='leader1').exists():
            leader = User.objects.create_user(
                username='leader1',
                password='leader123',
                role='leader',
                phone='13800138001'
            )
            self.stdout.write('   团长账号: leader1 / leader123')
            
            LeaderProfile.objects.create(
                user=leader,
                community_name='阳光小区',
                address='北京市朝阳区阳光小区1号楼',
                phone='13800138001',
                status='active',
                commission_rate=0.05
            )
            self.stdout.write('   团长档案已创建')
        else:
            leader = User.objects.get(username='leader1')
            self.stdout.write('   团长已存在')
        
        self.stdout.write('\n3. 创建普通用户账号...')
        if not User.objects.filter(username='user1').exists():
            user = User.objects.create_user(
                username='user1',
                password='user1234',
                role='user',
                phone='13900139001'
            )
            self.stdout.write('   用户账号: user1 / user1234')
        else:
            self.stdout.write('   用户已存在')
        
        self.stdout.write('\n4. 创建商品分类...')
        categories_data = [
            {'name': '新鲜水果', 'sort': 1},
            {'name': '蔬菜生鲜', 'sort': 2},
            {'name': '肉禽蛋奶', 'sort': 3},
            {'name': '粮油副食', 'sort': 4},
            {'name': '休闲零食', 'sort': 5},
        ]
        for cat_data in categories_data:
            Category.objects.get_or_create(name=cat_data['name'], defaults=cat_data)
        self.stdout.write(f'   已创建 {len(categories_data)} 个分类')
        
        self.stdout.write('\n5. 创建示例商品...')
        fruit_category, _ = Category.objects.get_or_create(name='新鲜水果')
        veg_category, _ = Category.objects.get_or_create(name='蔬菜生鲜')
        meat_category, _ = Category.objects.get_or_create(name='肉禽蛋奶')
        
        products_data = [
            {
                'category': fruit_category,
                'name': '红富士苹果',
                'description': '山东烟台红富士苹果，脆甜多汁，果肉细腻',
                'original_price': 12.00,
                'group_price': 8.99,
                'stock': 200,
                'status': 'up'
            },
            {
                'category': fruit_category,
                'name': '阳光玫瑰葡萄',
                'description': '阳光玫瑰青提，颗粒饱满，甜度高',
                'original_price': 39.90,
                'group_price': 29.90,
                'stock': 100,
                'status': 'up'
            },
            {
                'category': veg_category,
                'name': '有机蔬菜套餐',
                'description': '包含西红柿、黄瓜、生菜、小白菜等新鲜蔬菜',
                'original_price': 49.00,
                'group_price': 35.00,
                'stock': 150,
                'status': 'up'
            },
            {
                'category': meat_category,
                'name': '土鸡蛋30枚',
                'description': '农家散养土鸡蛋，营养丰富',
                'original_price': 68.00,
                'group_price': 48.00,
                'stock': 80,
                'status': 'up'
            },
            {
                'category': fruit_category,
                'name': '进口车厘子',
                'description': '智利进口车厘子J级，果肉饱满',
                'original_price': 99.00,
                'group_price': 79.90,
                'stock': 50,
                'status': 'up'
            }
        ]
        
        for prod_data in products_data:
            if not Product.objects.filter(name=prod_data['name']).exists():
                Product.objects.create(leader=leader, **prod_data)
                self.stdout.write(f'   已创建商品: {prod_data["name"]}')
        
        self.stdout.write('\n6. 创建自提点...')
        if not PickupPoint.objects.filter(leader=leader).exists():
            PickupPoint.objects.create(
                leader=leader,
                name='阳光小区自提点',
                address='北京市朝阳区阳光小区1号楼1单元101室',
                phone='13800138001',
                business_hours='9:00-21:00',
                status='active'
            )
            self.stdout.write('   自提点已创建')
        else:
            self.stdout.write('   自提点已存在')
        
        self.stdout.write('\n7. 创建团购活动...')
        if not GroupBuy.objects.filter(leader=leader, status='active').exists():
            products = Product.objects.filter(leader=leader, status='up')[:3]
            for product in products:
                GroupBuy.objects.create(
                    leader=leader,
                    product=product,
                    title=f'{product.name} 限时团购',
                    group_price=float(product.group_price) * 0.9,
                    min_group_size=3,
                    current_people=1,
                    start_time=datetime.now(),
                    end_time=datetime.now() + timedelta(days=3),
                    status='active'
                )
            self.stdout.write(f'   已创建 {len(products)} 个团购活动')
        else:
            self.stdout.write('   团购活动已存在')
        
        self.stdout.write(self.style.SUCCESS('\n=== 数据初始化完成 ==='))
        self.stdout.write('\n测试账号：')
        self.stdout.write('  管理员: admin / admin123456')
        self.stdout.write('  团长: leader1 / leader123')
        self.stdout.write('  用户: user1 / user1234')
        self.stdout.write('\n管理后台地址: http://localhost:8000/admin/')
        self.stdout.write('API文档地址: http://localhost:8000/api/docs/swagger/')
