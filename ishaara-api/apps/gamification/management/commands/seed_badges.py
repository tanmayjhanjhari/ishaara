from django.core.management.base import BaseCommand
from apps.gamification.models import Badge

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        Badge.objects.all().delete()
        badges = [
            # First Steps
            dict(name='First Sign',     description='Complete your very first sign attempt',
                 icon_url='🥇', condition_type='attempt_count',  condition_value=1),
            dict(name='Ten Signs',      description='Complete 10 sign attempts',
                 icon_url='✋', condition_type='attempt_count',  condition_value=10),
            dict(name='Fifty Signs',    description='Complete 50 sign attempts',
                 icon_url='💪', condition_type='attempt_count',  condition_value=50),
            dict(name='Century Club',   description='Complete 100 sign attempts',
                 icon_url='🌟', condition_type='attempt_count',  condition_value=100),
            dict(name='Sign Machine',   description='Complete 500 sign attempts',
                 icon_url='🤖', condition_type='attempt_count',  condition_value=500),
            # Learning
            dict(name='First Lesson',   description='Complete your first full lesson',
                 icon_url='📖', condition_type='lesson_count',   condition_value=1),
            dict(name='Scholar',        description='Complete 5 lessons',
                 icon_url='🎓', condition_type='lesson_count',   condition_value=5),
            dict(name='Graduate',       description='Complete 10 lessons',
                 icon_url='🏛️', condition_type='lesson_count',   condition_value=10),
            # Streaks
            dict(name='On Fire',        description='Maintain a 3-day streak',
                 icon_url='🔥', condition_type='streak_days',    condition_value=3),
            dict(name='Week Warrior',   description='Maintain a 7-day streak',
                 icon_url='📅', condition_type='streak_days',    condition_value=7),
            dict(name='Monthly Master', description='Maintain a 30-day streak',
                 icon_url='🗓️', condition_type='streak_days',    condition_value=30),
            # XP
            dict(name='XP Hunter',      description='Earn 100 total XP',
                 icon_url='⚡', condition_type='xp_total',       condition_value=100),
            dict(name='XP Champion',    description='Earn 500 total XP',
                 icon_url='💎', condition_type='xp_total',       condition_value=500),
            dict(name='XP Legend',      description='Earn 2000 total XP',
                 icon_url='👑', condition_type='xp_total',       condition_value=2000),
        ]
        for b in badges:
            Badge.objects.create(**b)
        self.stdout.write(f'Created {len(badges)} badges')
