from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check_view(request):
    return JsonResponse({'status': 'ok', 'service': 'ishaara-api'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('apps.users.urls')),
    path('api/v1/', include('apps.content.urls')),
    path('api/v1/', include('apps.progress.urls')),
    path('api/v1/', include('apps.gamification.urls')),
    path('api/v1/health/', health_check_view),
]
