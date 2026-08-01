from rest_framework import serializers
from .models import Sign, Lesson, LessonSign

class SignSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Sign
        fields = ['id', 'slug', 'label', 'category', 'difficulty', 'xp_reward', 'video_url']

class SignDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Sign
        fields = ['id', 'slug', 'label', 'category', 'difficulty', 'xp_reward',
                  'video_url', 'reference_landmarks']

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
        lesson_signs = obj.lesson_signs.select_related('sign').order_by('order_index')
        return SignDetailSerializer(
            [ls.sign for ls in lesson_signs], many=True).data

    class Meta(LessonSerializer.Meta):
        fields = LessonSerializer.Meta.fields + ['signs']

class AdminLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lesson
        fields = '__all__'
