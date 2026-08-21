from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from apps.users.models import User, Profile
from apps.gamification.models import Streak, UserBadge, Badge
from apps.progress.models import Attempt, LessonProgress
from utils.responses import success_response
from rest_framework import serializers


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon_url', 'condition_type', 'condition_value']


class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Rank by total XP (profile.xp_total), top 25
        profiles = (
            Profile.objects
            .select_related('user', 'user__streak')
            .order_by('-xp_total')[:25]
        )

        leaderboard = []
        my_rank = None
        my_entry = None

        for rank, profile in enumerate(profiles, start=1):
            user = profile.user
            streak = getattr(user, 'streak', None)
            is_me = user.id == request.user.id

            entry = {
                'rank': rank,
                'user_id': str(user.id),
                'username': user.username,
                'display_name': profile.display_name or user.username,
                'xp': profile.xp_total,
                'level': profile.level,
                'streak': streak.current_streak if streak else 0,
                'is_me': is_me,
            }
            leaderboard.append(entry)

            if is_me:
                my_rank = rank
                my_entry = entry

        # If current user not in top 25, compute their rank
        if my_rank is None:
            my_profile = request.user.profile
            my_rank = Profile.objects.filter(xp_total__gt=my_profile.xp_total).count() + 1
            my_streak = getattr(request.user, 'streak', None)
            my_entry = {
                'rank': my_rank,
                'user_id': str(request.user.id),
                'username': request.user.username,
                'display_name': my_profile.display_name or request.user.username,
                'xp': my_profile.xp_total,
                'level': my_profile.level,
                'streak': my_streak.current_streak if my_streak else 0,
                'is_me': True,
            }

        return success_response({
            'leaderboard': leaderboard,
            'my_rank': my_rank,
            'my_entry': my_entry,
        })


class MyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile
        streak = getattr(user, 'streak', None)

        # Signs mastered (is_success attempts, distinct signs)
        signs_mastered = (
            Attempt.objects
            .filter(user=user, is_success=True)
            .values('sign')
            .distinct()
            .count()
        )

        # Total attempts
        total_attempts = Attempt.objects.filter(user=user).count()

        # Lessons completed
        lessons_completed = LessonProgress.objects.filter(user=user, status='completed').count()

        # Average accuracy (mean score across all attempts)
        from django.db.models import Avg
        avg_qs = Attempt.objects.filter(user=user).aggregate(avg=Avg('score'))
        avg_accuracy = round(avg_qs['avg'] or 0, 1)

        # Earned badges with details
        user_badges = (
            UserBadge.objects
            .filter(user=user)
            .select_related('badge')
            .order_by('-earned_at')
        )
        earned_badges = [
            {
                'id': str(ub.badge.id),
                'name': ub.badge.name,
                'description': ub.badge.description,
                'icon_url': ub.badge.icon_url,
                'earned_at': ub.earned_at.isoformat(),
            }
            for ub in user_badges
        ]

        # XP needed for next level (simple formula: level * 500)
        xp_for_next = profile.level * 500
        xp_progress = profile.xp_total % 500
        xp_progress_pct = round((xp_progress / 500) * 100)

        return success_response({
            'xp_total': profile.xp_total,
            'level': profile.level,
            'xp_for_next_level': xp_for_next,
            'xp_progress': xp_progress,
            'xp_progress_pct': xp_progress_pct,
            'current_streak': streak.current_streak if streak else 0,
            'longest_streak': streak.longest_streak if streak else 0,
            'signs_mastered': signs_mastered,
            'total_attempts': total_attempts,
            'lessons_completed': lessons_completed,
            'avg_accuracy': avg_accuracy,
            'badges_earned': earned_badges,
            'display_name': profile.display_name or user.username,
            'date_joined': user.date_joined.isoformat(),
        })


class XPView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        from services.xp_service import LEVEL_THRESHOLDS
        current_level = profile.level
        prev_threshold = LEVEL_THRESHOLDS[current_level - 1] if current_level >= 1 else 0
        next_threshold = LEVEL_THRESHOLDS[current_level] if current_level < 50 else None
        return success_response({
            'total_xp':      profile.xp_total,
            'level':         current_level,
            'prev_level_xp': prev_threshold,
            'next_level_xp': next_threshold,
            'xp_to_next':    (next_threshold - profile.xp_total) if next_threshold else 0
        })


class StreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.gamification.models import Streak
        streak, _ = Streak.objects.get_or_create(user=request.user)
        return success_response({
            'current_streak':   streak.current_streak,
            'longest_streak':   streak.longest_streak,
            'last_active_date': str(streak.last_active_date) if streak.last_active_date else None
        })


