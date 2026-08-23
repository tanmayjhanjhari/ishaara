from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User, Profile
from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer, MeSerializer, UpdateProfileSerializer
)
from utils.responses import success_response, error_response

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    }

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors, status=400)
        user = serializer.save()
        user.profile.display_name = user.username
        user.profile.save()
        tokens = get_tokens_for_user(user)
        return success_response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data
        }, status=201)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response(serializer.errors, status=401)
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        return success_response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': MeSerializer(user).data
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return error_response('Refresh token required', status=400)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success_response({}, message='Logged out successfully')
        except Exception:
            return error_response('Invalid token', status=400)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.select_related('profile', 'streak').get(id=request.user.id)
        return success_response(MeSerializer(user).data)

    def put(self, request):
        profile = request.user.profile
        serializer = UpdateProfileSerializer(profile, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(serializer.errors, status=400)
        serializer.save()
        return success_response(serializer.data)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user    = request.user
        profile = user.profile

        from apps.progress.models import Attempt, LessonProgress
        from apps.gamification.models import XPEvent, UserBadge, Badge, Streak
        streak, _ = Streak.objects.get_or_create(user=user)
        from apps.content.models import Lesson
        from services.xp_service import compute_level, LEVEL_THRESHOLDS
        from django.db.models import Avg, Count, Sum, IntegerField
        from django.utils import timezone
        from datetime import timedelta

        today      = timezone.now().date()
        week_ago   = timezone.now() - timedelta(days=7)

        # Recent attempts (last 5)
        recent_attempts = (
            Attempt.objects
            .filter(user=user)
            .select_related('sign')
            .order_by('-created_at')[:5]
        )

        # Weak signs (success rate < 0.6, attempts >= 3)
        from django.db.models import Case, When, Value

        weak_signs_qs = (
            Attempt.objects
            .filter(user=user)
            .values('sign__slug', 'sign__label')
            .annotate(
                total=Count('id'),
                successes=Sum(Case(
                    When(is_success=True, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField()
                ))
            )
            .filter(total__gte=3)
            .order_by('sign__label')
        )

        weak_signs = []
        for s in weak_signs_qs:
            rate = s['successes'] / s['total'] if s['total'] > 0 else 0
            if rate < 0.6:
                weak_signs.append({
                    'slug':         s['sign__slug'],
                    'label':        s['sign__label'],
                    'success_rate': round(rate * 100),
                    'attempts':     s['total']
                })
        weak_signs = sorted(weak_signs, key=lambda x: x['success_rate'])[:3]

        # Lesson progress
        lesson_progress = (
            LessonProgress.objects
            .filter(user=user)
            .select_related('lesson')
            .order_by('-updated_at')[:3]
        )

        # Weekly XP
        weekly_xp = (
            XPEvent.objects
            .filter(user=user, created_at__gte=week_ago)
            .aggregate(total=Sum('amount'))['total'] or 0
        )

        # Total attempts today
        attempts_today = Attempt.objects.filter(
            user=user,
            created_at__date=today
        ).count()

        # Badges recently earned
        recent_badges = (
            UserBadge.objects
            .filter(user=user)
            .select_related('badge')
            .order_by('-earned_at')[:3]
        )

        # XP thresholds (corrected formula indices to match actual levels)
        level        = profile.level
        prev_xp      = LEVEL_THRESHOLDS[level - 1] if level > 0 else 0
        next_xp      = LEVEL_THRESHOLDS[level] if level < 50 else None

        # Daily challenge (most recent active)
        from apps.content.models import Challenge
        todays_challenge = Challenge.objects.filter(
            active_date=today).first()

        return success_response({
            'profile': {
                'display_name': profile.display_name or user.username,
                'level':        level,
                'xp_total':     profile.xp_total,
                'prev_level_xp': prev_xp,
                'next_level_xp': next_xp,
                'weekly_xp':    weekly_xp,
                'attempts_today': attempts_today
            },
            'streak': {
                'current':    streak.current_streak if streak else 0,
                'longest':    streak.longest_streak if streak else 0,
                'last_active': str(streak.last_active_date) if streak else None,
                'is_active_today': (
                    str(streak.last_active_date) == str(today)
                    if streak and streak.last_active_date else False
                )
            },
            'weak_signs': weak_signs,
            'recent_attempts': [
                {
                    'sign_label': a.sign.label,
                    'sign_slug':  a.sign.slug,
                    'score':      a.score,
                    'is_success': a.is_success,
                    'created_at': a.created_at.isoformat()
                }
                for a in recent_attempts
            ],
            'lesson_progress': [
                {
                    'lesson_id':    str(lp.lesson.id),
                    'lesson_title': lp.lesson.title,
                    'status':       lp.status,
                    'accuracy':     lp.accuracy
                }
                for lp in lesson_progress
            ],
            'recent_badges': [
                {
                    'name':      ub.badge.name,
                    'icon':      ub.badge.icon_url,
                    'earned_at': ub.earned_at.isoformat()
                }
                for ub in recent_badges
            ],
            'daily_challenge': {
                'id':          str(todays_challenge.id),
                'title':       todays_challenge.title,
                'description': todays_challenge.description,
                'xp_reward':   todays_challenge.xp_reward
            } if todays_challenge else None
        })

