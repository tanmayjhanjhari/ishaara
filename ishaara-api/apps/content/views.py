from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Sign, Lesson, LessonSign
from .serializers import (
    SignSerializer, SignDetailSerializer, AdminSignSerializer,
    LessonSerializer, LessonDetailSerializer, AdminLessonSerializer
)
from .filters import SignFilter, LessonFilter
from .permissions import IsStaffUser
from utils.responses import success_response, error_response

class SignListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        signs = Sign.objects.all().order_by('category', 'difficulty', 'label')
        f = SignFilter(request.GET, queryset=signs)
        serializer = SignSerializer(f.qs, many=True)
        return success_response(serializer.data)

class SignDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, slug):
        sign = get_object_or_404(Sign, slug=slug)
        serializer = SignDetailSerializer(sign)
        return success_response(serializer.data)

class LessonListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        lessons = (Lesson.objects
            .filter(is_published=True)
            .prefetch_related('lesson_signs__sign')
            .order_by('order_index', 'difficulty'))
        f = LessonFilter(request.GET, queryset=lessons)
        serializer = LessonSerializer(
            f.qs, many=True, context={'request': request})
        return success_response(serializer.data)

class LessonDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pk):
        lesson = get_object_or_404(
            Lesson.objects.prefetch_related('lesson_signs__sign'),
            pk=pk, is_published=True)
        serializer = LessonDetailSerializer(
            lesson, context={'request': request})
        
        data = serializer.data
        if request.user.is_authenticated:
            from apps.progress.models import SignProgress
            completed_sign_ids = set(
                SignProgress.objects.filter(
                    user=request.user,
                    lesson=lesson,
                    is_completed=True
                ).values_list('sign_id', flat=True)
            )
            completed_sign_str_ids = {str(x) for x in completed_sign_ids}
            if 'signs' in data:
                for sign in data['signs']:
                    sign['is_completed'] = sign['id'] in completed_sign_str_ids

        return success_response(data)


class AdminSignListView(APIView):
    permission_classes = [IsStaffUser]
    def get(self, request):
        signs = Sign.objects.all().order_by('-created_at')
        serializer = AdminSignSerializer(signs, many=True)
        return success_response(serializer.data)

    def post(self, request):
        serializer = AdminSignSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors)
        serializer.save()
        return success_response(serializer.data, status=201)

class AdminSignDetailView(APIView):
    permission_classes = [IsStaffUser]
    def get(self, request, pk):
        sign = get_object_or_404(Sign, pk=pk)
        return success_response(AdminSignSerializer(sign).data)

    def put(self, request, pk):
        sign = get_object_or_404(Sign, pk=pk)
        serializer = AdminSignSerializer(sign, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(serializer.errors)
        serializer.save()
        return success_response(serializer.data)

    def delete(self, request, pk):
        sign = get_object_or_404(Sign, pk=pk)
        sign.delete()
        return Response(status=204)

class AdminLessonListView(APIView):
    permission_classes = [IsStaffUser]
    def get(self, request):
        lessons = Lesson.objects.all().order_by('order_index')
        return success_response(AdminLessonSerializer(lessons, many=True).data)

    def post(self, request):
        serializer = AdminLessonSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(serializer.errors)
        serializer.save()
        return success_response(serializer.data, status=201)

class AdminLessonDetailView(APIView):
    permission_classes = [IsStaffUser]
    def put(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        serializer = AdminLessonSerializer(lesson, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(serializer.errors)
        serializer.save()
        return success_response(serializer.data)

    def delete(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        lesson.delete()
        return Response(status=204)

class AdminLessonAddSignView(APIView):
    permission_classes = [IsStaffUser]
    def post(self, request, pk):
        lesson  = get_object_or_404(Lesson, pk=pk)
        sign_id = request.data.get('sign_id')
        order   = request.data.get('order_index', 0)
        sign    = get_object_or_404(Sign, pk=sign_id)
        LessonSign.objects.get_or_create(
            lesson=lesson, sign=sign,
            defaults={'order_index': order})
        serializer = LessonDetailSerializer(
            lesson, context={'request': request})
        return success_response(serializer.data)

class AdminLessonRemoveSignView(APIView):
    permission_classes = [IsStaffUser]
    def delete(self, request, pk, sign_id):
        lesson_sign = get_object_or_404(
            LessonSign, lesson_id=pk, sign_id=sign_id)
        lesson_sign.delete()
        return Response(status=204)
