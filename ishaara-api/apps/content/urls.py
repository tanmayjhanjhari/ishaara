from django.urls import path
from .views import (
    SignListView, SignDetailView, LessonListView, LessonDetailView,
    AdminSignListView, AdminSignDetailView, AdminLessonListView,
    AdminLessonDetailView, AdminLessonAddSignView, AdminLessonRemoveSignView
)

urlpatterns = [
    path('signs/',                            SignListView.as_view()),
    path('signs/<slug:slug>/',                SignDetailView.as_view()),
    path('lessons/',                          LessonListView.as_view()),
    path('lessons/<uuid:pk>/',                LessonDetailView.as_view()),
    path('admin/signs/',                      AdminSignListView.as_view()),
    path('admin/signs/<uuid:pk>/',            AdminSignDetailView.as_view()),
    path('admin/lessons/',                    AdminLessonListView.as_view()),
    path('admin/lessons/<uuid:pk>/',          AdminLessonDetailView.as_view()),
    path('admin/lessons/<uuid:pk>/add-sign/', AdminLessonAddSignView.as_view()),
    path('admin/lessons/<uuid:pk>/remove-sign/<uuid:sign_id>/',
         AdminLessonRemoveSignView.as_view()),
]
