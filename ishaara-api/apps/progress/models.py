import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

STATUS_CHOICES = [
    ('not_started', 'Not Started'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
]

class Attempt(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempts')
    sign       = models.ForeignKey('content.Sign', on_delete=models.CASCADE, related_name='attempts')
    score      = models.FloatField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_success = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'sign', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f'{self.user} → {self.sign.label}: {self.score}'

class LessonProgress(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson       = models.ForeignKey('content.Lesson', on_delete=models.CASCADE, related_name='user_progress')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    accuracy     = models.FloatField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('user', 'lesson')]

    def __str__(self):
        return f'{self.user} → {self.lesson.title}: {self.status}'
