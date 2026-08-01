from django.core.management.base import BaseCommand
from apps.gamification.models import Badge

class Command(BaseCommand):
    help = 'Seed initial badges'

    def handle(self, *args, **kwargs):
        badges = [
            {'name': 'First Step', 'condition_type': 'attempt_count', 'condition_value': 1, 'description': 'Complete your first attempt.'},
            {'name': 'Getting Warm', 'condition_type': 'attempt_count', 'condition_value': 10, 'description': 'Complete 10 attempts.'},
            {'name': 'Committed', 'condition_type': 'attempt_count', 'condition_value': 50, 'description': 'Complete 50 attempts.'},
            {'name': 'First Lesson', 'condition_type': 'lesson_count', 'condition_value': 1, 'description': 'Complete your first lesson.'},
            {'name': 'Scholar', 'condition_type': 'lesson_count', 'condition_value': 5, 'description': 'Complete 5 lessons.'},
            {'name': 'On Fire', 'condition_type': 'streak_days', 'condition_value': 3, 'description': 'Maintain a 3 day streak.'},
            {'name': 'Week Warrior', 'condition_type': 'streak_days', 'condition_value': 7, 'description': 'Maintain a 7 day streak.'},
            {'name': 'XP Hunter', 'condition_type': 'xp_total', 'condition_value': 100, 'description': 'Earn 100 XP.'},
            {'name': 'Rising Star', 'condition_type': 'xp_total', 'condition_value': 500, 'description': 'Earn 500 XP.'},
        ]
        
        for badge_data in badges:
            Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults={
                    'condition_type': badge_data['condition_type'],
                    'condition_value': badge_data['condition_value'],
                    'description': badge_data['description'],
                }
            )
        self.stdout.write(self.style.SUCCESS('Successfully seeded badges'))
