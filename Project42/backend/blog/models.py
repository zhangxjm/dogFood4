from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
import markdown


class Category(models.Model):
    name = models.CharField('分类名称', max_length=100, unique=True)
    slug = models.SlugField('URL别名', max_length=100, unique=True, blank=True)
    description = models.TextField('描述', blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '分类'
        verbose_name_plural = '分类'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField('标签名称', max_length=50, unique=True)
    slug = models.SlugField('URL别名', max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '标签'
        verbose_name_plural = '标签'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    STATUS_CHOICES = (
        ('draft', '草稿'),
        ('published', '已发布'),
    )

    title = models.CharField('标题', max_length=200)
    slug = models.SlugField('URL别名', max_length=200, unique=True, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='作者')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='分类')
    tags = models.ManyToManyField(Tag, blank=True, verbose_name='标签')
    content = models.TextField('内容')
    content_html = models.TextField('HTML内容', blank=True)
    excerpt = models.TextField('摘要', blank=True, max_length=500)
    cover_image = models.ImageField('封面图片', upload_to='covers/', blank=True, null=True)
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='draft')
    views = models.PositiveIntegerField('浏览量', default=0)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)
    published_at = models.DateTimeField('发布时间', null=True, blank=True)

    class Meta:
        verbose_name = '文章'
        verbose_name_plural = '文章'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        self.content_html = markdown.markdown(self.content, extensions=['extra', 'codehilite', 'toc'])
        if not self.excerpt and self.content:
            self.excerpt = self.content[:200] + '...'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Comment(models.Model):
    STATUS_CHOICES = (
        ('pending', '待审核'),
        ('approved', '已通过'),
        ('rejected', '已拒绝'),
    )

    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments', verbose_name='文章')
    author_name = models.CharField('昵称', max_length=100)
    author_email = models.EmailField('邮箱')
    author_website = models.URLField('网站', blank=True)
    content = models.TextField('内容')
    status = models.CharField('状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    ip_address = models.GenericIPAddressField('IP地址', blank=True, null=True)
    user_agent = models.CharField('User Agent', max_length=500, blank=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies', verbose_name='父评论')

    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.author_name} - {self.content[:50]}'


class Visitor(models.Model):
    ip_address = models.GenericIPAddressField('IP地址', unique=True)
    user_agent = models.CharField('User Agent', max_length=500, blank=True)
    first_visit = models.DateTimeField('首次访问时间', auto_now_add=True)
    last_visit = models.DateTimeField('最后访问时间', auto_now=True)
    visit_count = models.PositiveIntegerField('访问次数', default=1)
    page_views = models.PositiveIntegerField('页面浏览量', default=0)

    class Meta:
        verbose_name = '访客'
        verbose_name_plural = '访客'
        ordering = ['-last_visit']

    def __str__(self):
        return self.ip_address


class DailyStats(models.Model):
    date = models.DateField('日期', unique=True)
    page_views = models.PositiveIntegerField('页面浏览量', default=0)
    unique_visitors = models.PositiveIntegerField('独立访客', default=0)
    new_visitors = models.PositiveIntegerField('新访客', default=0)

    class Meta:
        verbose_name = '每日统计'
        verbose_name_plural = '每日统计'
        ordering = ['-date']

    def __str__(self):
        return str(self.date)
