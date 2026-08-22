from django.urls import path
from .views import LeaderboardView, MyStatsView, XPView, StreakView, BadgeListView

urlpatterns = [
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('me/stats/', MyStatsView.as_view(), name='my-stats'),
    path('xp/', XPView.as_view(), name='xp'),
    path('streak/', StreakView.as_view(), name='streak'),
    path('badges/', BadgeListView.as_view(), name='badges'),
]



