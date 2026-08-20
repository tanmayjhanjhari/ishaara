from django.urls import path
from .views import LeaderboardView, MyStatsView

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('me/stats/', MyStatsView.as_view(), name='my-stats'),
]
