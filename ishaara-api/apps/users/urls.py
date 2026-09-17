from django.urls import re_path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    re_path(r'^auth/register/?$', views.RegisterView.as_view()),
    re_path(r'^auth/login/?$',    views.LoginView.as_view()),
    re_path(r'^auth/logout/?$',   views.LogoutView.as_view()),
    re_path(r'^auth/refresh/?$',  TokenRefreshView.as_view()),
    re_path(r'^users/me/?$',      views.MeView.as_view()),
    re_path(r'^dashboard/?$',     views.DashboardView.as_view()),
    re_path(r'^admin/stats/?$',   views.AdminStatsView.as_view()),
]

