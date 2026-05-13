from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', '用户'),
        ('leader', '团长'),
        ('admin', '管理员'),
    )
    
    role = models.CharField('角色', max_length=10, choices=ROLE_CHOICES, default='user')
    phone = models.CharField('手机号', max_length=11, blank=True, null=True)
    avatar = models.ImageField('头像', upload_to='avatars/', blank=True, null=True)
    openid = models.CharField('微信OpenID', max_length=100, blank=True, null=True)
    unionid = models.CharField('微信UnionID', max_length=100, blank=True, null=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return self.username


class LeaderProfile(models.Model):
    STATUS_CHOICES = (
        ('pending', '待审核'),
        ('active', '已激活'),
        ('disabled', '已禁用'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='leader_profile', verbose_name='用户')
    community_name = models.CharField('小区名称', max_length=100)
    address = models.CharField('详细地址', max_length=200)
    phone = models.CharField('联系电话', max_length=11)
    status = models.CharField('状态', max_length=10, choices=STATUS_CHOICES, default='pending')
    commission_rate = models.DecimalField('佣金比例', max_digits=5, decimal_places=2, default=0.05)
    total_commission = models.DecimalField('累计佣金', max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'leader_profiles'
        verbose_name = '团长档案'
        verbose_name_plural = verbose_name
    
    def __str__(self):
        return f"{self.user.username} - {self.community_name}"


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses', verbose_name='用户')
    name = models.CharField('收货人', max_length=50)
    phone = models.CharField('手机号', max_length=11)
    province = models.CharField('省份', max_length=50)
    city = models.CharField('城市', max_length=50)
    district = models.CharField('区县', max_length=50)
    detail = models.CharField('详细地址', max_length=200)
    is_default = models.BooleanField('默认地址', default=False)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    
    class Meta:
        db_table = 'addresses'
        verbose_name = '收货地址'
        verbose_name_plural = verbose_name
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).update(is_default=False)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} - {self.province}{self.city}{self.district}{self.detail}"
