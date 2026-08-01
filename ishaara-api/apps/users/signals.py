from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, Profile

@receiver(post_save, sender=User)
def create_user_resources(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
        from apps.gamification.models import Streak
        Streak.objects.create(user=instance)
