from django.contrib import admin
from .models import Sign, Lesson, LessonSign

class SignAdmin(admin.ModelAdmin):
    list_display = ['label', 'slug', 'category', 'difficulty', 'xp_reward']

admin.site.register(Sign, SignAdmin)
admin.site.register(Lesson)
admin.site.register(LessonSign)
