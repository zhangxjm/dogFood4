from django.contrib import admin
from .models import Category, Tag, Article, Comment, Visitor, DailyStats


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'description', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'views', 'created_at', 'published_at']
    list_filter = ['status', 'category', 'tags', 'created_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    raw_id_fields = ['author']
    filter_horizontal = ['tags']
    date_hierarchy = 'created_at'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'author_email', 'article', 'status', 'ip_address', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['author_name', 'author_email', 'content']
    actions = ['approve_comments', 'reject_comments']

    def approve_comments(self, request, queryset):
        queryset.update(status='approved')
    approve_comments.short_description = '批准选中的评论'

    def reject_comments(self, request, queryset):
        queryset.update(status='rejected')
    reject_comments.short_description = '拒绝选中的评论'


@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ['ip_address', 'first_visit', 'last_visit', 'visit_count', 'page_views']
    list_filter = ['first_visit', 'last_visit']
    search_fields = ['ip_address']
    readonly_fields = ['ip_address', 'first_visit', 'last_visit', 'visit_count', 'page_views', 'user_agent']


@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    list_display = ['date', 'page_views', 'unique_visitors', 'new_visitors']
    list_filter = ['date']
    readonly_fields = ['date', 'page_views', 'unique_visitors', 'new_visitors']
