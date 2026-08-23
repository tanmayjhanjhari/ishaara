from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Avg
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.content.models import Sign, Lesson
from .models import Attempt, LessonProgress
from .serializers import (
    CreateAttemptSerializer, AttemptSerializer,
    LessonProgressSerializer, CompleteLessonSerializer,
    BadgeSerializer,
)
from services import xp_service, streak_service, badge_service
from utils.responses import success_response, error_response

LESSON_COMPLETION_BONUS = 50


class AttemptCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateAttemptSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors)

        data = serializer.validated_data
        user = request.user
        sign = get_object_or_404(Sign, pk=data['sign_id'])

        with transaction.atomic():
            attempt = Attempt.objects.create(
                user=user,
                sign=sign,
                score=data['score'],
                is_success=data['is_success'],
            )
            
            lesson_id = data.get('lesson_id')
            if lesson_id:
                from .models import SignProgress
                sp, _ = SignProgress.objects.get_or_create(
                    user=user, sign=sign, lesson_id=lesson_id)
                sp.attempts += 1
                if data['score'] > sp.best_score:
                    sp.best_score = data['score']
                if data['is_success'] and not sp.is_completed:
                    sp.is_completed = True
                    sp.completed_at = timezone.now()
                sp.save()

            xp_to_award = xp_service.compute_xp_for_attempt(
                data['score'], sign.xp_reward)
            xp_result = xp_service.award_xp(
                user, xp_to_award, 'attempt', attempt.id)
            streak_result = streak_service.update_streak(user)
            badges_earned = badge_service.check_badges(user)

        return success_response({
            'attempt_id':     str(attempt.id),
            'xp_earned':      xp_result['xp_earned'],
            'total_xp':       xp_result['total_xp'],
            'new_level':      xp_result['new_level'],
            'leveled_up':     xp_result['leveled_up'],
            'current_streak': streak_result['current_streak'],
            'streak_updated': streak_result['streak_updated'],
            'badges_earned':  BadgeSerializer(badges_earned, many=True).data,
        }, status=201)



class AttemptListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        attempts = (Attempt.objects
            .filter(user=request.user)
            .select_related('sign')
            .order_by('-created_at'))

        sign_id = request.query_params.get('sign_id')
        if sign_id:
            attempts = attempts.filter(sign_id=sign_id)

        limit = int(request.query_params.get('limit', 20))
        attempts = attempts[:limit]

        return success_response(AttemptSerializer(attempts, many=True).data)


class LessonCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, lesson_id):
        serializer = CompleteLessonSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors)

        lesson   = get_object_or_404(Lesson, pk=lesson_id, is_published=True)
        user     = request.user
        accuracy = serializer.validated_data.get('accuracy', 0)

        with transaction.atomic():
            progress, created = LessonProgress.objects.update_or_create(
                user=user,
                lesson=lesson,
                defaults={
                    'status':       'completed',
                    'accuracy':     accuracy,
                    'completed_at': timezone.now(),
                },
            )
            xp_result     = xp_service.award_xp(
                user, LESSON_COMPLETION_BONUS, 'lesson', lesson.id)
            badges_earned = badge_service.check_badges(user)

        return success_response({
            'lesson_id':     str(lesson.id),
            'status':        'completed',
            'accuracy':      accuracy,
            'completed_at':  progress.completed_at.isoformat(),
            'xp_earned':     xp_result['xp_earned'],
            'total_xp':      xp_result['total_xp'],
            'leveled_up':    xp_result['leveled_up'],
            'new_level':     xp_result['new_level'],
            'badges_earned': BadgeSerializer(badges_earned, many=True).data,
        })


class ProgressSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        lesson_progress = (LessonProgress.objects
            .filter(user=user)
            .select_related('lesson')
            .order_by('-updated_at'))

        attempts        = Attempt.objects.filter(user=user)
        total_attempts  = attempts.count()
        total_successes = attempts.filter(is_success=True).count()
        signs_practiced = attempts.values('sign').distinct().count()

        if total_attempts > 0:
            avg = attempts.aggregate(avg=Avg('score'))['avg']
            average_accuracy = round(avg, 1) if avg else 0.0
        else:
            average_accuracy = 0.0

        return success_response({
            'lessons':          LessonProgressSerializer(lesson_progress, many=True).data,
            'total_attempts':   total_attempts,
            'total_successes':  total_successes,
            'average_accuracy': average_accuracy,
            'signs_practiced':  signs_practiced,
        })
