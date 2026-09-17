from django.urls import re_path
from .views import (
    SignListView, SignDetailView, LessonListView, LessonDetailView,
    AdminSignListView, AdminSignDetailView, AdminLessonListView,
    AdminLessonDetailView, AdminLessonAddSignView, AdminLessonRemoveSignView
)

urlpatterns = [
    re_path(r'^signs/?$',                                          SignListView.as_view()),
    re_path(r'^signs/(?P<slug>[-a-zA-Z0-9_]+)/?$',                SignDetailView.as_view()),
    re_path(r'^lessons/?$',                                        LessonListView.as_view()),
    re_path(r'^lessons/(?P<pk>[0-9a-f-]+)/?$',                     LessonDetailView.as_view()),
    re_path(r'^admin/signs/?$',                                    AdminSignListView.as_view()),
    re_path(r'^admin/signs/(?P<pk>[0-9a-f-]+)/?$',                 AdminSignDetailView.as_view()),
    re_path(r'^admin/lessons/?$',                                  AdminLessonListView.as_view()),
    re_path(r'^admin/lessons/(?P<pk>[0-9a-f-]+)/?$',               AdminLessonDetailView.as_view()),
    re_path(r'^admin/lessons/(?P<pk>[0-9a-f-]+)/add-sign/?$',      AdminLessonAddSignView.as_view()),
    re_path(r'^admin/lessons/(?P<pk>[0-9a-f-]+)/remove-sign/(?P<sign_id>[0-9a-f-]+)/?$',
            AdminLessonRemoveSignView.as_view()),
]

