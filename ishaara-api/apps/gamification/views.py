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
        from django.db.models import Sum
        from django.utils import timezone
        from datetime import timedelta
        from apps.gamification.models import XPEvent
        from apps.users.models import User

        # Compute start of current week (Monday 00:00 UTC)
        now        = timezone.now()
        days_since = now.weekday()  # 0=Monday, 6=Sunday
        week_start = (now - timedelta(days=days_since)).replace(
            hour=0, minute=0, second=0, microsecond=0)

        # Time until next Monday
        next_monday    = week_start + timedelta(days=7)
        resets_in_secs = int((next_monday - now).total_seconds())

        # Aggregate weekly XP per user
        weekly_xp = (
            XPEvent.objects
            .filter(created_at__gte=week_start)
            .values('user_id')
            .annotate(weekly_xp=Sum('amount'))
            .order_by('-weekly_xp')
        )

        # Get top 20
        top20_user_ids = [str(e['user_id']) for e in weekly_xp[:20]]
        top20_xp_map   = {str(e['user_id']): e['weekly_xp'] for e in weekly_xp[:20]}

        # Fetch user details for top 20
        users = (
            User.objects
            .filter(id__in=top20_user_ids)
            .select_related('profile')
        )
        user_map = {str(u.id): u for u in users}

        # Build ranked entries
        entries = []
        for rank, user_id in enumerate(top20_user_ids, 1):
            u = user_map.get(user_id)
            if not u:
                continue
            display = (u.profile.display_name or u.username
                       if hasattr(u, 'profile') else u.username)
            entries.append({
                'rank':            rank,
                'user_id':         user_id,
                'display_name':    display,
                'level':           u.profile.level if hasattr(u, 'profile') else 1,
                'weekly_xp':       top20_xp_map[user_id],
                'is_current_user': user_id == str(request.user.id)
            })

        # Current user rank (may be outside top 20)
        all_user_ids = [str(e['user_id']) for e in weekly_xp]
        current_user_xp = 0
        current_rank    = None

        for i, e in enumerate(weekly_xp):
            if str(e['user_id']) == str(request.user.id):
                current_rank    = i + 1
                current_user_xp = e['weekly_xp']
                break

        # XP needed to reach next rank
        xp_to_next = 0
        if current_rank and current_rank > 1:
          rank_above_xp = None
          for e in weekly_xp:
              if str(e['user_id']) != str(request.user.id):
                  try:
                      idx = all_user_ids.index(str(e['user_id']))
                      if idx == current_rank - 2:
                          rank_above_xp = e['weekly_xp']
                          break
                  except ValueError:
                      pass
          if rank_above_xp:
              xp_to_next = rank_above_xp - current_user_xp + 1

        current_user_data = {
            'rank':           current_rank,
            'weekly_xp':      current_user_xp,
            'xp_to_next_rank': xp_to_next
        }

        return success_response({
            'week_start':         week_start.date().isoformat(),
            'resets_in_seconds':  resets_in_secs,
            'entries':            entries,
            'current_user':       current_user_data
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


class BadgeListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        all_badges = Badge.objects.all().order_by(
            'condition_type', 'condition_value')
        earned_ids = set(
            UserBadge.objects.filter(user=user)
            .values_list('badge_id', flat=True))
        user_badges_map = {
            str(ub.badge_id): ub.earned_at
            for ub in UserBadge.objects.filter(user=user)}

        # Current user stats for progress calculation
        from services.badge_service import get_user_stat
        stat_cache = {}

        earned = []
        locked = []

        for badge in all_badges:
            if badge.id in earned_ids:
                earned.append({
                    'id':              str(badge.id),
                    'name':            badge.name,
                    'description':     badge.description,
                    'icon':            badge.icon_url,
                    'condition_type':  badge.condition_type,
                    'condition_value': badge.condition_value,
                    'earned_at':       user_badges_map[str(badge.id)].isoformat()
                })
            else:
                ctype = badge.condition_type
                if ctype not in stat_cache:
                    stat_cache[ctype] = get_user_stat(user, ctype)
                current = stat_cache[ctype]
                progress_pct = min(100, round(
                    (current / badge.condition_value) * 100)) if badge.condition_value > 0 else 100
                locked.append({
                    'id':               str(badge.id),
                    'name':             badge.name,
                    'description':      badge.description,
                    'icon':             badge.icon_url,
                    'condition_type':   badge.condition_type,
                    'condition_value':  badge.condition_value,
                    'user_progress':    current,
                    'progress_percent': progress_pct
                })

        return success_response({
            'earned':          earned,
            'locked':          locked,
            'total_earned':    len(earned),
            'total_available': len(earned) + len(locked)
        })



