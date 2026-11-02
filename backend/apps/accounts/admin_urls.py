from django.urls import path
from .admin_views import AdminStatsView, AdminUserListView, AdminChangeRoleView

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('users/', AdminUserListView.as_view(), name='admin-users'),
    path('users/<int:pk>/change_role/', AdminChangeRoleView.as_view(), name='admin-change-role'),
]
