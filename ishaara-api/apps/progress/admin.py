from django.contrib import admin
from .models import Attempt, LessonProgress

class AttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'sign', 'score', 'is_success', 'created_at']

admin.site.register(Attempt, AttemptAdmin)
admin.site.register(LessonProgress)
