import uuid
from django.db import models
from django.conf import settings

SOURCE_CHOICES = [
    ('attempt', 'Attempt'),
    ('lesson', 'Lesson Completed'),
    ('streak_bonus', 'Streak Bonus'),
]

CONDITION_CHOICES = [
    ('attempt_count', 'Total Attempts'),
    ('lesson_count', 'Lessons Completed'),
    ('streak_days', 'Streak Days'),
    ('xp_total', 'Total XP'),
]

class XPEvent(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp_events')
    amount      = models.IntegerField()
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    source_id   = models.UUIDField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', '-created_at'])]

    def __str__(self):
        return f'{self.user} +{self.amount} XP ({self.source_type})'

class Streak(models.Model):
    id               = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user             = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak   = models.IntegerField(default=0)
    longest_streak   = models.IntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user} — {self.current_streak} day streak'

class Badge(models.Model):
    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name            = models.CharField(max_length=100, unique=True)
    description     = models.TextField()
    icon_url        = models.URLField(blank=True)
    condition_type  = models.CharField(max_length=30, choices=CONDITION_CHOICES)
    condition_value = models.IntegerField()

    class Meta:
        ordering = ['condition_type', 'condition_value']

    def __str__(self):
        return f'{self.name} ({self.condition_type} >= {self.condition_value})'

class UserBadge(models.Model):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_badges')
    badge     = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='user_badges')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'badge')]
        ordering = ['-earned_at']

    def __str__(self):
        return f'{self.user} earned {self.badge.name}'
