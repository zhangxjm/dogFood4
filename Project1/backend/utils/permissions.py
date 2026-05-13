from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsLeader(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'leader'


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'leader'):
            return obj.leader == request.user
        return False


class IsLeaderOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'leader'
