import requests
import json

# First, register and login to get token
BASE_URL = "http://localhost:5001"

# Register
register_data = {
    "email": "test@test.com",
    "password": "test1234",
    "first_name": "Test",
    "last_name": "User"
}

try:
    r = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    print(f"Register: {r.status_code}")
except:
    pass  # User might already exist

# Login
login_data = {
    "email": "test@test.com",
    "password": "test1234"
}

r = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
print(f"Login: {r.status_code}")
token = r.json()['access_token']
print(f"Token: {token[:20]}...")

# Submit assessment
assessment_data = {
    "assessment_data": {
        "anxiety_level": 15,
        "self_esteem": 20,
        "mental_health_history": 0,
        "depression": 10,
        "headache": 2,
        "blood_pressure": 1,
        "sleep_quality": 3,
        "breathing_problem": 1,
        "noise_level": 2,
        "living_conditions": 4,
        "safety": 4,
        "basic_needs": 4,
        "academic_performance": 3,
        "study_load": 3,
        "teacher_student_relationship": 4,
        "future_career_concerns": 3,
        "social_support": 3,
        "peer_pressure": 2,
        "extracurricular_activities": 3,
        "bullying": 1
    }
}

headers = {"Authorization": f"Bearer {token}"}
r = requests.post(f"{BASE_URL}/api/assessment/submit", json=assessment_data, headers=headers)
print(f"\nSubmit assessment: {r.status_code}")
print(f"Response: {r.text}")
