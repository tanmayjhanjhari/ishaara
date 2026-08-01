import os
import sys
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.content.models import Lesson

API_URL = "http://localhost:8000/api/v1"

def run_tests():
    print("Testing Feature 7 Endpoints...")

    # Create test users
    staff_user, _ = User.objects.get_or_create(username='staff7', email='staff7@ishaara.com', is_staff=True)
    staff_user.set_password('pass123')
    staff_user.save()

    regular_user, _ = User.objects.get_or_create(username='regular7', email='regular7@ishaara.com', is_staff=False)
    regular_user.set_password('pass123')
    regular_user.save()

    # Login to get tokens
    r = requests.post(f"{API_URL}/auth/login/", json={'email': 'staff7@ishaara.com', 'password': 'pass123'})
    staff_token = r.json()['data']['access']

    r = requests.post(f"{API_URL}/auth/login/", json={'email': 'regular7@ishaara.com', 'password': 'pass123'})
    regular_token = r.json()['data']['access']

    regular_headers = {'Authorization': f'Bearer {regular_token}'}
    staff_headers = {'Authorization': f'Bearer {staff_token}'}

    # Test 1 - Sign list
    r = requests.get(f"{API_URL}/signs/", headers=regular_headers)
    assert r.status_code == 200, f"Test 1 Failed: {r.status_code}"
    assert len(r.json()['data']) == 26
    assert 'reference_landmarks' not in r.json()['data'][0]
    print("Test 1 PASS")

    # Test 2 - Sign filter
    r = requests.get(f"{API_URL}/signs/?category=alphabet", headers=regular_headers)
    assert r.status_code == 200
    assert len(r.json()['data']) == 26
    print("Test 2 PASS")

    # Test 3 - Sign detail
    r = requests.get(f"{API_URL}/signs/sign-a/", headers=regular_headers)
    assert r.status_code == 200
    assert 'reference_landmarks' in r.json()['data']
    print("Test 3 PASS")

    # Test 4 - Lesson list
    r = requests.get(f"{API_URL}/lessons/", headers=regular_headers)
    assert r.status_code == 200
    data = r.json()['data']
    assert len(data) == 1
    assert data[0]['sign_count'] == 26
    assert data[0]['user_progress_status'] == 'not_started'
    lesson_id = data[0]['id']
    print("Test 4 PASS")

    # Test 5 - Lesson detail
    r = requests.get(f"{API_URL}/lessons/{lesson_id}/", headers=regular_headers)
    assert r.status_code == 200
    assert len(r.json()['data']['signs']) == 26
    print("Test 5 PASS")

    # Test 6 - Admin sign create
    r = requests.post(f"{API_URL}/admin/signs/", headers=staff_headers, json={
        "slug": "sign-test",
        "label": "Test",
        "category": "alphabet",
        "difficulty": 1,
        "xp_reward": 10
    })
    assert r.status_code == 201
    print("Test 6 PASS")

    # Test 7 - Admin block non-staff
    r = requests.post(f"{API_URL}/admin/signs/", headers=regular_headers, json={
        "slug": "sign-test2",
        "label": "Test2",
        "category": "alphabet",
        "difficulty": 1,
        "xp_reward": 10
    })
    assert r.status_code == 403
    print("Test 7 PASS")

    print("ALL TESTS PASSED")

if __name__ == '__main__':
    run_tests()
