import string
from django.core.management.base import BaseCommand
from apps.content.models import Sign, Lesson, LessonSign

class Command(BaseCommand):
    help = 'Seed initial ISL alphabet content'

    def handle(self, *args, **kwargs):
        signs = []
        for index, letter in enumerate(string.ascii_uppercase):
            sign, created = Sign.objects.get_or_create(
                slug=f'sign-{letter.lower()}',
                defaults={
                    'label': letter,
                    'category': 'alphabet',
                    'difficulty': 1,
                    'xp_reward': 10,
                }
            )
            signs.append(sign)

        lesson, created = Lesson.objects.get_or_create(
            title='ISL Alphabet',
            defaults={
                'description': 'Learn all 26 letters of the Indian Sign Language alphabet',
                'category': 'alphabet',
                'difficulty': 1,
                'order_index': 0,
                'required_level': 1,
                'is_published': True
            }
        )

        for index, sign in enumerate(signs):
            LessonSign.objects.get_or_create(
                lesson=lesson,
                sign=sign,
                defaults={'order_index': index}
            )

        self.stdout.write(self.style.SUCCESS("Created 26 signs and 1 lesson successfully"))
