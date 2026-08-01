import django_filters
from .models import Sign, Lesson

class SignFilter(django_filters.FilterSet):
    category   = django_filters.CharFilter(lookup_expr='exact')
    difficulty = django_filters.NumberFilter(lookup_expr='exact')
    search     = django_filters.CharFilter(field_name='label', lookup_expr='icontains')
    class Meta:
        model  = Sign
        fields = ['category', 'difficulty']

class LessonFilter(django_filters.FilterSet):
    category   = django_filters.CharFilter(lookup_expr='exact')
    difficulty = django_filters.NumberFilter(lookup_expr='exact')
    class Meta:
        model  = Lesson
        fields = ['category', 'difficulty']
