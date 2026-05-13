from django.db import models
from apps.users.models import User


class Category(models.Model):
    name = models.CharField('分类名称', max_length=50)
    icon = models.ImageField('分类图标', upload_to='categories/', blank=True, null=True)
    sort = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = '商品分类'
        verbose_name_plural = verbose_name
        ordering = ['sort', '-created_at']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    STATUS_CHOICES = (
        ('draft', '草稿'),
        ('up', '上架'),
        ('down', '下架'),
    )
    
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', verbose_name='团长')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', verbose_name='分类')
    name = models.CharField('商品名称', max_length=100)
    description = models.TextField('商品描述', blank=True)
    image = models.ImageField('商品图片', upload_to='products/', blank=True, null=True)
    original_price = models.DecimalField('原价', max_digits=10, decimal_places=2)
    group_price = models.DecimalField('团购价', max_digits=10, decimal_places=2)
    stock = models.IntegerField('库存', default=0)
    sold_count = models.IntegerField('已售数量', default=0)
    status = models.CharField('状态', max_length=10, choices=STATUS_CHOICES, default='draft')
    sort = models.IntegerField('排序', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'products'
        verbose_name = '商品'
        verbose_name_plural = verbose_name
        ordering = ['sort', '-created_at']
    
    def __str__(self):
        return self.name
