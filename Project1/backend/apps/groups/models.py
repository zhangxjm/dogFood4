from django.db import models
from apps.users.models import User
from apps.products.models import Product


class GroupBuy(models.Model):
    STATUS_CHOICES = (
        ('active', '进行中'),
        ('ended', '已结束'),
        ('cancelled', '已取消'),
    )
    
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='group_buys', verbose_name='团长')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='group_buys', verbose_name='商品')
    title = models.CharField('团购标题', max_length=100)
    group_price = models.DecimalField('团购价', max_digits=10, decimal_places=2)
    min_group_size = models.IntegerField('最小成团人数', default=2)
    current_people = models.IntegerField('当前人数', default=0)
    start_time = models.DateTimeField('开始时间')
    end_time = models.DateTimeField('结束时间')
    status = models.CharField('状态', max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'group_buys'
        verbose_name = '团购活动'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
