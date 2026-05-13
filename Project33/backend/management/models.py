from django.db import models


class Technician(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, '在职'),
        (STATUS_INACTIVE, '离职'),
    ]
    
    GENDER_MALE = 'male'
    GENDER_FEMALE = 'female'
    GENDER_CHOICES = [
        (GENDER_MALE, '男'),
        (GENDER_FEMALE, '女'),
    ]
    
    name = models.CharField(max_length=50, verbose_name='姓名')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default=GENDER_MALE, verbose_name='性别')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='联系电话')
    position = models.CharField(max_length=50, blank=True, null=True, verbose_name='职位')
    skills = models.TextField(blank=True, null=True, verbose_name='擅长技能')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE, verbose_name='状态')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'technician'
        ordering = ['-created_at']
        verbose_name = '技师'
        verbose_name_plural = '技师管理'
    
    def __str__(self):
        return self.name


class Schedule(models.Model):
    SHIFT_MORNING = 'morning'
    SHIFT_AFTERNOON = 'afternoon'
    SHIFT_EVENING = 'evening'
    SHIFT_FULL = 'full'
    SHIFT_OFF = 'off'
    
    SHIFT_CHOICES = [
        (SHIFT_MORNING, '早班'),
        (SHIFT_AFTERNOON, '午班'),
        (SHIFT_EVENING, '晚班'),
        (SHIFT_FULL, '全天'),
        (SHIFT_OFF, '休息'),
    ]
    
    technician = models.ForeignKey(Technician, on_delete=models.CASCADE, related_name='schedules', verbose_name='技师')
    date = models.DateField(verbose_name='日期')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default=SHIFT_FULL, verbose_name='班次')
    notes = models.TextField(blank=True, null=True, verbose_name='备注')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        db_table = 'schedule'
        ordering = ['-date', 'technician']
        unique_together = ['technician', 'date']
        verbose_name = '排班'
        verbose_name_plural = '排班管理'
    
    def __str__(self):
        return f'{self.technician.name} - {self.date} - {self.get_shift_display()}'
