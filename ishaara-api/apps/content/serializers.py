from rest_framework import serializers
from .models import Sign, Lesson, LessonSign

class SignSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Sign
        fields = ['id', 'slug', 'label', 'category', 'difficulty', 'xp_reward', 'video_url', 'description']

class SignDetailSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model  = Sign
        fields = ['id', 'slug', 'label', 'category', 'difficulty', 'xp_reward',
                  'video_url', 'reference_landmarks', 'is_completed', 'description']

    def get_is_completed(self, obj):
        completed_sign_ids = self.context.get('completed_sign_ids')
        if completed_sign_ids is not None:
            return obj.id in completed_sign_ids
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from apps.progress.models import Attempt
            return Attempt.objects.filter(
                user=request.user, sign=obj, is_success=True
            ).exists()
        return False

class AdminSignSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Sign
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    sign_count           = serializers.SerializerMethodField()
    user_progress_status = serializers.SerializerMethodField()

    def get_sign_count(self, obj):
        return obj.lesson_signs.count()

    def get_user_progress_status(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 'not_started'
        from apps.progress.models import LessonProgress
        progress = LessonProgress.objects.filter(
            user=request.user, lesson=obj).first()
        return progress.status if progress else 'not_started'

    class Meta:
        model  = Lesson
        fields = ['id', 'title', 'description', 'category', 'difficulty',
                  'order_index', 'required_level', 'is_published',
                  'sign_count', 'user_progress_status']

class LessonDetailSerializer(LessonSerializer):
    signs = serializers.SerializerMethodField()

    def get_signs(self, obj):
        request = self.context.get('request')
        completed_sign_ids = set()
        if request and request.user.is_authenticated:
            from apps.progress.models import Attempt
            completed_sign_ids = set(
                Attempt.objects.filter(
                    user=request.user,
                    sign__lesson_signs__lesson=obj,
                    is_success=True
                ).values_list('sign_id', flat=True)
            )
        
        lesson_signs = obj.lesson_signs.select_related('sign').order_by('order_index')
        return SignDetailSerializer(
            [ls.sign for ls in lesson_signs],
            many=True,
            context={**self.context, 'completed_sign_ids': completed_sign_ids}
        ).data

    class Meta(LessonSerializer.Meta):
        fields = LessonSerializer.Meta.fields + ['signs']

class AdminLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lesson
        fields = '__all__'
