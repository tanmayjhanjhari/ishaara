from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from apps.gamification.models import XPEvent

User = get_user_model()

class LeaderboardTests(APITestCase):
    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(username='alice', email='alice@example.com', password='password123')
        self.user2 = User.objects.create_user(username='bob', email='bob@example.com', password='password123')
        
        # Ensure profiles exist
        if not hasattr(self.user1, 'profile'):
            from apps.users.models import Profile
            Profile.objects.create(user=self.user1)
        if not hasattr(self.user2, 'profile'):
            from apps.users.models import Profile
            Profile.objects.create(user=self.user2)

    def test_empty_leaderboard(self):
        """Test 1: Empty leaderboard with current user unranked/rank 1 with 0 XP"""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/v1/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data['data']
        self.assertEqual(len(data['entries']), 0)
        self.assertEqual(data['current_user']['weekly_xp'], 0)

    def test_xp_appears_on_leaderboard(self):
        """Test 2: User with weekly XP appears on the leaderboard"""
        # Create XP event for user1
        XPEvent.objects.create(user=self.user1, amount=100, source_type='attempt')
        
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/v1/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data['data']
        self.assertEqual(len(data['entries']), 1)
        self.assertEqual(data['entries'][0]['user_id'], str(self.user1.id))
        self.assertEqual(data['entries'][0]['weekly_xp'], 100)
        self.assertEqual(data['current_user']['rank'], 1)
        self.assertEqual(data['current_user']['weekly_xp'], 100)

    def test_week_boundary(self):
        """Test 4: XP events from previous week are not counted"""
        now = timezone.now()
        days_since = now.weekday()
        week_start = (now - timedelta(days=days_since)).replace(
            hour=0, minute=0, second=0, microsecond=0)
        
        # XP event from last week (2 days before current week start)
        last_week_time = week_start - timedelta(days=2)
        event = XPEvent.objects.create(
            user=self.user1,
            amount=1000,
            source_type='attempt'
        )
        # Update created_at using filter update (since auto_now_add doesn't allow direct save overwrite)
        XPEvent.objects.filter(id=event.id).update(created_at=last_week_time)
        
        # XP event from this week
        XPEvent.objects.create(
            user=self.user1,
            amount=50,
            source_type='attempt'
        )

        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/v1/leaderboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.data['data']
        self.assertEqual(len(data['entries']), 1)
        self.assertEqual(data['entries'][0]['weekly_xp'], 50)
