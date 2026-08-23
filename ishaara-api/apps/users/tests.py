from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from apps.progress.models import Attempt, LessonProgress
from apps.content.models import Sign, Lesson, Challenge
from apps.gamification.models import Streak, XPEvent, Badge, UserBadge

User = get_user_model()

class DashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='dashboard_user',
            email='dash@example.com',
            password='password123'
        )
        if not hasattr(self.user, 'profile'):
            from apps.users.models import Profile
            self.profile = Profile.objects.create(user=self.user, display_name="Dash User")
        else:
            self.profile = self.user.profile
            self.profile.display_name = "Dash User"
            self.profile.save()

        # Update streak
        self.streak, _ = Streak.objects.get_or_create(user=self.user)
        self.streak.current_streak = 5
        self.streak.longest_streak = 10
        self.streak.last_active_date = timezone.now().date()
        self.streak.save()


        # Create a sign for attempts
        self.sign = Sign.objects.create(
            slug='sign-a',
            label='A',
            category='alphabet',
            difficulty=1,
            xp_reward=10
        )

    def test_dashboard_summary(self):
        self.client.force_authenticate(user=self.user)

        # Create attempts
        # Create 3 failed attempts (success_rate = 0)
        for _ in range(3):
            Attempt.objects.create(
                user=self.user,
                sign=self.sign,
                score=30,
                is_success=False
            )

        # Create a badge
        badge = Badge.objects.create(
            name='First Steps',
            description='Complete your first sign attempt',
            icon_url='🥇',
            condition_type='attempt_count',
            condition_value=1
        )
        UserBadge.objects.create(user=self.user, badge=badge)

        # Create a daily challenge
        Challenge.objects.create(
            title='Daily ISL Alphabet Challenge',
            description='Practice alphabet signs today',
            xp_reward=50,
            active_date=timezone.now().date()
        )

        response = self.client.get('/api/v1/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data['data']

        # Assert profile data
        self.assertEqual(data['profile']['display_name'], 'Dash User')
        self.assertEqual(data['profile']['level'], 1)

        # Assert streak data
        self.assertEqual(data['streak']['current'], 5)
        self.assertEqual(data['streak']['longest'], 10)
        self.assertTrue(data['streak']['is_active_today'])

        # Assert weak signs (rate < 0.6, total attempts >= 3)
        self.assertEqual(len(data['weak_signs']), 1)
        self.assertEqual(data['weak_signs'][0]['slug'], 'sign-a')
        self.assertEqual(data['weak_signs'][0]['success_rate'], 0)
        self.assertEqual(data['weak_signs'][0]['attempts'], 3)

        # Assert recent attempts count
        self.assertEqual(len(data['recent_attempts']), 3)

        # Assert daily challenge
        self.assertIsNotNone(data['daily_challenge'])
        self.assertEqual(data['daily_challenge']['title'], 'Daily ISL Alphabet Challenge')
