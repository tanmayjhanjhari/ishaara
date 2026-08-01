import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

CATEGORY_CHOICES = [
    ('alphabet', 'Alphabet'),
    ('word', 'Word'),
    ('phrase', 'Phrase'),
    ('mixed', 'Mixed'),
]

class Sign(models.Model):
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug                = models.SlugField(unique=True)
    label               = models.CharField(max_length=100)
    category            = models.CharField(max_length=20, choices=CATEGORY_CHOICES[:3], default='alphabet')
    difficulty          = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    reference_landmarks = models.JSONField(null=True, blank=True)
    video_url           = models.URLField(blank=True)
    xp_reward           = models.IntegerField(default=10)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'difficulty', 'label']

    def __str__(self):
        return f'{self.label} ({self.category})'

class Lesson(models.Model):
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title          = models.CharField(max_length=200)
    description    = models.TextField(blank=True)
    category       = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='alphabet')
    difficulty     = models.IntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(5)])
    order_index    = models.IntegerField(default=0)
    required_level = models.IntegerField(default=1)
    is_published   = models.BooleanField(default=False)
    signs          = models.ManyToManyField(Sign, through='LessonSign', blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order_index', 'difficulty']

    def __str__(self):
        return self.title

class LessonSign(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson      = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='lesson_signs')
    sign        = models.ForeignKey(Sign, on_delete=models.CASCADE, related_name='lesson_signs')
    order_index = models.IntegerField(default=0)

    class Meta:
        ordering = ['order_index']
        unique_together = [('lesson', 'sign')]

    def __str__(self):
        return f'{self.lesson.title} → {self.sign.label} (#{self.order_index})'
