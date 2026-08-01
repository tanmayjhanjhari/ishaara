from rest_framework import serializers
from .models import Attempt, LessonProgress
from apps.content.serializers import SignSerializer
from apps.gamification.models import Badge


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Badge
        fields = ['id', 'name', 'description', 'icon_url',
                  'condition_type', 'condition_value']


class AttemptSerializer(serializers.ModelSerializer):
    sign = SignSerializer(read_only=True)

    class Meta:
        model  = Attempt
        fields = ['id', 'sign', 'score', 'is_success', 'created_at']


class CreateAttemptSerializer(serializers.Serializer):
    sign_id    = serializers.UUIDField()
    score      = serializers.FloatField(min_value=0, max_value=100)
    is_success = serializers.BooleanField()


class LessonProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)

    class Meta:
        model  = LessonProgress
        fields = ['id', 'lesson_id', 'lesson_title',
                  'status', 'accuracy', 'completed_at', 'updated_at']


class CompleteLessonSerializer(serializers.Serializer):
    accuracy = serializers.FloatField(min_value=0, max_value=100, required=False)


class ProgressSummarySerializer(serializers.Serializer):
    lessons          = LessonProgressSerializer(many=True)
    total_attempts   = serializers.IntegerField()
    total_successes  = serializers.IntegerField()
    average_accuracy = serializers.FloatField()
    signs_practiced  = serializers.IntegerField()
