from django.db import models
from apps.users.models import User


class PickupPoint(models.Model):
    STATUS_CHOICES = (
        ('active', '营业中'),
        ('closed', '已关闭'),
    )
    
    leader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pickup_points', verbose_name='团长')
    name = models.CharField('自提点名称', max_length=100)
    address = models.CharField('详细地址', max_length=200)
    phone = models.CharField('联系电话', max_length=11)
    business_hours = models.CharField('营业时间', max_length=100, blank=True, null=True)
    longitude = models.DecimalField('经度', max_digits=10, decimal_places=6, blank=True, null=True)
    latitude = models.DecimalField('纬度', max_digits=10, decimal_places=6, blank=True, null=True)
    status = models.CharField('状态', max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'pickup_points'
        verbose_name = '自提点'
        verbose_name_plural = verbose_name
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
