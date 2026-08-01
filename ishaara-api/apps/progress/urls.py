from django.urls import path
from . import views

urlpatterns = [
    path('attempts/',
         views.AttemptCreateView.as_view()),
    path('attempts/history/',
         views.AttemptListView.as_view()),
    path('progress/',
         views.ProgressSummaryView.as_view()),
    path('progress/lessons/<uuid:lesson_id>/complete/',
         views.LessonCompleteView.as_view()),
]
