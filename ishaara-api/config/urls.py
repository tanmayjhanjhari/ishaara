from django.contrib import admin
from django.urls import path, include, re_path
from django.http import JsonResponse

def health_check_view(request):
    return JsonResponse({
        'status': 'ok',
        'service': 'ishaara-api',
        'message': 'Ishaara Backend API is running'
    })

urlpatterns = [
    path('', health_check_view),
    path('health/', health_check_view),
    path('health', health_check_view),
    path('api/', health_check_view),
    path('api', health_check_view),
    path('api/v1/', health_check_view),
    path('api/v1', health_check_view),
    path('api/v1/health/', health_check_view),
    path('api/v1/health', health_check_view),
    path('admin/', admin.site.urls),
    re_path(r'^api/v1/', include('apps.users.urls')),
    re_path(r'^api/v1/', include('apps.content.urls')),
    re_path(r'^api/v1/', include('apps.progress.urls')),
    re_path(r'^api/v1/', include('apps.gamification.urls')),
]

