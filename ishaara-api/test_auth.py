import requests

BASE_URL = 'http://localhost:8000/api/v1'

def run_tests():
    print("Test 1 - Register")
    r1 = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": "auth_test@test.com", "username": "authtest",
        "password": "TestPass123", "confirm_password": "TestPass123"
    })
    print(r1.status_code, r1.json())
    assert r1.status_code == 201
    
    # Extract tokens for later use
    access_token = r1.json()['data']['access']
    refresh_token = r1.json()['data']['refresh']

    print("\nTest 2 - Register duplicate")
    r2 = requests.post(f"{BASE_URL}/auth/register/", json={
        "email": "auth_test@test.com", "username": "authtest",
        "password": "TestPass123", "confirm_password": "TestPass123"
    })
    print(r2.status_code, r2.json())
    assert r2.status_code == 400
    
    print("\nTest 3 - Login")
    r3 = requests.post(f"{BASE_URL}/auth/login/", json={
        "email": "auth_test@test.com", "password": "TestPass123"
    })
    print(r3.status_code, r3.json())
    assert r3.status_code == 200

    print("\nTest 4 - Get profile")
    r4 = requests.get(f"{BASE_URL}/users/me/", headers={
        "Authorization": f"Bearer {access_token}"
    })
    print(r4.status_code, r4.json())
    assert r4.status_code == 200

    print("\nTest 5 - Get profile without token")
    r5 = requests.get(f"{BASE_URL}/users/me/")
    print(r5.status_code, r5.json())
    assert r5.status_code == 401

    print("\nTest 6 - Update profile")
    r6 = requests.put(f"{BASE_URL}/users/me/", headers={
        "Authorization": f"Bearer {access_token}"
    }, json={
        "display_name": "Test User"
    })
    print(r6.status_code, r6.json())
    assert r6.status_code == 200

    print("\nTest 7 - Logout")
    r7 = requests.post(f"{BASE_URL}/auth/logout/", headers={
        "Authorization": f"Bearer {access_token}"
    }, json={
        "refresh": refresh_token
    })
    print(r7.status_code, r7.json())
    assert r7.status_code == 200

    print("\nTest 8 - Refresh after logout")
    r8 = requests.post(f"{BASE_URL}/auth/refresh/", json={
        "refresh": refresh_token
    })
    print(r8.status_code, r8.json())
    assert r8.status_code == 401
    
    print("\nAll 8 tests passed successfully!")

if __name__ == '__main__':
    run_tests()
