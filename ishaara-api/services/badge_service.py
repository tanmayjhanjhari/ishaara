from apps.gamification.models import Badge, UserBadge
from apps.progress.models import Attempt, LessonProgress


def get_user_stat(user, condition_type):
    if condition_type == 'attempt_count':
        return Attempt.objects.filter(user=user).count()
    elif condition_type == 'lesson_count':
        return LessonProgress.objects.filter(
            user=user, status='completed').count()
    elif condition_type == 'streak_days':
        return getattr(user.streak, 'current_streak', 0)
    elif condition_type == 'xp_total':
        return user.profile.xp_total
    return 0


def check_badges(user):
    earned_badge_ids = UserBadge.objects.filter(
        user=user).values_list('badge_id', flat=True)
    unearned_badges = Badge.objects.exclude(id__in=earned_badge_ids)
    newly_earned = []
    for badge in unearned_badges:
        stat = get_user_stat(user, badge.condition_type)
        if stat >= badge.condition_value:
            UserBadge.objects.create(user=user, badge=badge)
            newly_earned.append(badge)
    return newly_earned
