from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Category, Tag, Article, Comment, Visitor, DailyStats


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at', 'article_count']

    def get_article_count(self, obj):
        return obj.article_set.filter(status='published').count()


class TagSerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'created_at', 'article_count']

    def get_article_count(self, obj):
        return obj.article_set.filter(status='published').count()


class ArticleListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'author', 'category', 'tags', 'excerpt', 
                  'cover_image', 'status', 'views', 'created_at', 'published_at', 'comment_count']

    def get_comment_count(self, obj):
        return obj.comments.filter(status='approved').count()


class ArticleDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'author', 'category', 'tags', 'content', 
                  'content_html', 'excerpt', 'cover_image', 'status', 'views', 
                  'created_at', 'updated_at', 'published_at']


class ArticleCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = ['id', 'title', 'slug', 'category', 'tags', 'content', 
                  'excerpt', 'cover_image', 'status']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    article_title = serializers.CharField(source='article.title', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'article', 'article_title', 'author_name', 'author_email', 
                  'author_website', 'content', 'status', 'created_at', 'parent', 'replies']
        read_only_fields = ['status', 'ip_address', 'user_agent']

    def get_replies(self, obj):
        if obj.replies.filter(status='approved').exists():
            return CommentSerializer(obj.replies.filter(status='approved'), many=True).data
        return []


class CommentManageSerializer(serializers.ModelSerializer):
    article_title = serializers.CharField(source='article.title', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'article', 'article_title', 'author_name', 'author_email', 
                  'content', 'status', 'ip_address', 'created_at']


class VisitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = ['id', 'ip_address', 'first_visit', 'last_visit', 'visit_count', 'page_views']


class DailyStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyStats
        fields = ['id', 'date', 'page_views', 'unique_visitors', 'new_visitors']


class DashboardStatsSerializer(serializers.Serializer):
    total_articles = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_views = serializers.IntegerField()
    pending_comments = serializers.IntegerField()
    today_views = serializers.IntegerField()
    today_visitors = serializers.IntegerField()
