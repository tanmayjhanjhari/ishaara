import os, sys, django, requests
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.users.models import User
from apps.content.models import Sign, Lesson

API = "http://localhost:8000/api/v1"

def get_token(email, password):
    r = requests.post(f"{API}/auth/login/", json={'email': email, 'password': password})
    assert r.status_code == 200, f"Login failed: {r.text}"
    return r.json()['data']['access']

def run():
    print("Feature 9 - Progress Tracking API Tests\n")

    user, _ = User.objects.get_or_create(username='prog9', email='prog9@ishaara.com')
    user.set_password('TestPass1234'); user.save()

    token   = get_token('prog9@ishaara.com', 'TestPass1234')
    headers = {'Authorization': f'Bearer {token}'}

    sign_a = Sign.objects.get(slug='sign-a')
    sign_b = Sign.objects.get(slug='sign-b')
    lesson = Lesson.objects.get(title='ISL Alphabet')

    # Test 1 - Successful attempt (score >= 50)
    r = requests.post(f"{API}/attempts/", headers=headers, json={
        'sign_id': str(sign_a.id), 'score': 85, 'is_success': True})
    assert r.status_code == 201, f"T1: {r.status_code} {r.text}"
    d = r.json()['data']
    assert d['xp_earned'] > 0
    assert 'current_streak' in d
    assert isinstance(d['badges_earned'], list)
    print(f"PASS Test 1 - xp_earned={d['xp_earned']}, streak={d['current_streak']}")

    # Test 2 - Failed attempt (score < 50) -> xp = 0
    r = requests.post(f"{API}/attempts/", headers=headers, json={
        'sign_id': str(sign_b.id), 'score': 35, 'is_success': False})
    assert r.status_code == 201, f"T2: {r.status_code} {r.text}"
    d = r.json()['data']
    assert d['xp_earned'] == 0, f"T2: xp_earned={d['xp_earned']}"
    print(f"PASS Test 2 - failed attempt xp_earned={d['xp_earned']}")

    # Test 3 - Same-day streak is idempotent
    r = requests.post(f"{API}/attempts/", headers=headers, json={
        'sign_id': str(sign_a.id), 'score': 75, 'is_success': True})
    assert r.status_code == 201, f"T3: {r.status_code} {r.text}"
    d = r.json()['data']
    assert d['streak_updated'] == False, f"T3: streak_updated={d['streak_updated']}"
    print(f"PASS Test 3 - streak_updated={d['streak_updated']} (same-day idempotent)")

    # Test 4 - Attempt history with sign details
    r = requests.get(f"{API}/attempts/history/", headers=headers)
    assert r.status_code == 200, f"T4: {r.status_code} {r.text}"
    history = r.json()['data']
    assert len(history) >= 3
    assert 'sign' in history[0] and 'label' in history[0]['sign']
    print(f"PASS Test 4 - history has {len(history)} attempts")

    # Test 5 - Complete lesson -> xp_earned = 50
    r = requests.post(f"{API}/progress/lessons/{lesson.id}/complete/",
        headers=headers, json={'accuracy': 78.5})
    assert r.status_code == 200, f"T5: {r.status_code} {r.text}"
    d = r.json()['data']
    assert d['xp_earned'] == 50, f"T5: xp_earned={d['xp_earned']}"
    assert d['status'] == 'completed'
    print(f"PASS Test 5 - lesson completed, xp_earned={d['xp_earned']}, level={d['new_level']}")

    # Test 6 - Progress summary
    r = requests.get(f"{API}/progress/", headers=headers)
    assert r.status_code == 200, f"T6: {r.status_code} {r.text}"
    d = r.json()['data']
    assert d['total_attempts'] >= 3
    assert any(l['status'] == 'completed' for l in d['lessons'])
    print(f"PASS Test 6 - {d['total_attempts']} attempts, summary OK")

    # Test 7 - Lessons endpoint shows completed status
    r = requests.get(f"{API}/lessons/", headers=headers)
    assert r.status_code == 200, f"T7: {r.status_code} {r.text}"
    lessons = r.json()['data']
    assert any(l['user_progress_status'] == 'completed' for l in lessons), \
        f"T7: statuses={[l['user_progress_status'] for l in lessons]}"
    print(f"PASS Test 7 - lessons endpoint reflects completed status")

    print("\nALL 7 TESTS PASSED")

if __name__ == '__main__':
    run()
