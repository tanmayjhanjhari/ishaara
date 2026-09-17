from django.urls import re_path
from . import views

urlpatterns = [
    re_path(r'^attempts/?$',
            views.AttemptCreateView.as_view()),
    re_path(r'^attempts/history/?$',
            views.AttemptListView.as_view()),
    re_path(r'^progress/?$',
            views.ProgressSummaryView.as_view()),
    re_path(r'^progress/lessons/(?P<lesson_id>[0-9a-f-]+)/complete/?$',
            views.LessonCompleteView.as_view()),
]

