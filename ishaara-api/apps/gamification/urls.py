from django.urls import path
from .views import LeaderboardView, MyStatsView, XPView

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('me/stats/', MyStatsView.as_view(), name='my-stats'),
    path('xp/', XPView.as_view(), name='xp'),
]

