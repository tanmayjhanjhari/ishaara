from datetime import date, timedelta
from apps.gamification.models import Streak


def update_streak(user):
    streak, created = Streak.objects.get_or_create(user=user)
    today = date.today()

    if streak.last_active_date == today:
        return {
            'current_streak': streak.current_streak,
            'longest_streak': streak.longest_streak,
            'streak_updated': False,
        }

    yesterday = today - timedelta(days=1)

    if streak.last_active_date == yesterday:
        streak.current_streak += 1
    else:
        streak.current_streak = 1

    if streak.current_streak > streak.longest_streak:
        streak.longest_streak = streak.current_streak

    streak.last_active_date = today
    streak.save()

    return {
        'current_streak': streak.current_streak,
        'longest_streak': streak.longest_streak,
        'streak_updated': True,
    }
