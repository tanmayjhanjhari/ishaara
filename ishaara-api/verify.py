from apps.users.models import User, Profile
from apps.content.models import Sign, Lesson
from apps.gamification.models import Badge, Streak

User.objects.filter(username='testuser').delete()
u = User.objects.create_user(
  email='test@test.com', username='testuser', password='testpass123')
print(u.profile)
print(u.streak)
print(Badge.objects.count())
