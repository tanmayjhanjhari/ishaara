from django.urls import re_path
from .views import LeaderboardView, MyStatsView, XPView, StreakView, BadgeListView

urlpatterns = [
    re_path(r'^leaderboard/?$', LeaderboardView.as_view(), name='leaderboard'),
    re_path(r'^me/stats/?$',    MyStatsView.as_view(),     name='my-stats'),
    re_path(r'^xp/?$',          XPView.as_view(),          name='xp'),
    re_path(r'^streak/?$',      StreakView.as_view(),      name='streak'),
    re_path(r'^badges/?$',      BadgeListView.as_view(),   name='badges'),
]




