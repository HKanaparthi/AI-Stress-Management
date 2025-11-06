# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { }
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Rate Limiting

- Default: 200 requests per day, 50 per hour
- Registration: 5 per hour
- Login: 10 per minute
- Assessment submission: 10 per hour

## Endpoints

---

## Authentication Endpoints

### Register User

Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Rate Limit:** 5 per hour

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"
}
```

**Field Validation:**
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `first_name`: Required
- `last_name`: Required
- `role`: Optional, defaults to "student" (student|counselor|admin)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_login": null
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**
- `400`: Missing required field, invalid email, password too short
- `409`: Email already registered
- `500`: Registration failed

---

### Login

Authenticates a user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Rate Limit:** 10 per minute

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_login": "2024-01-15T14:20:00.000Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Error Responses:**
- `400`: Email and password required
- `401`: Invalid email or password
- `403`: Account deactivated
- `500`: Login failed

---

### Get Current User

Returns the authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_login": "2024-01-15T14:20:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Invalid or missing token
- `404`: User not found
- `500`: Failed to get user

---

### Update Profile

Updates user profile information.

**Endpoint:** `PUT /api/auth/update-profile`

**Authentication:** Required

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith"
}
```

**Success Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "student",
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_login": "2024-01-15T14:20:00.000Z"
  }
}
```

---

### Change Password

Changes the user's password.

**Endpoint:** `POST /api/auth/change-password`

**Authentication:** Required

**Rate Limit:** 3 per hour

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword456"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400`: Current and new password required
- `401`: Current password incorrect
- `500`: Password change failed

---

## Assessment Endpoints

### Submit Assessment

Submits a new stress assessment and receives prediction.

**Endpoint:** `POST /api/assessment/submit`

**Authentication:** Required

**Rate Limit:** 10 per hour

**Request Body:**
```json
{
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
```

**Success Response (201):**
```json
{
  "message": "Assessment submitted successfully",
  "assessment": {
    "id": 1,
    "user_id": 1,
    "assessment_data": { },
    "stress_level": "Moderate Risk",
    "confidence_score": 0.87,
    "all_probabilities": {
      "Low Risk": 0.05,
      "Moderate Risk": 0.87,
      "High Risk": 0.08
    },
    "top_contributors": [
      {
        "feature": "anxiety_level",
        "value": 15,
        "importance": 0.18,
        "impact_score": 2.7
      },
      {
        "feature": "depression",
        "value": 10,
        "importance": 0.15,
        "impact_score": 1.5
      }
    ],
    "recommendations": [
      "Practice deep breathing exercises...",
      "Consider mindfulness meditation...",
      "..."
    ],
    "created_at": "2024-01-15T15:00:00.000Z",
    "notes": null
  }
}
```

**Error Responses:**
- `400`: Assessment data required
- `404`: User not found
- `500`: Assessment submission failed

---

### Get Assessment History

Returns paginated list of user's past assessments.

**Endpoint:** `GET /api/assessment/history`

**Authentication:** Required

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `per_page` (optional, default: 10): Items per page

**Example:** `GET /api/assessment/history?page=1&per_page=10`

**Success Response (200):**
```json
{
  "assessments": [
    {
      "id": 2,
      "stress_level": "Low Risk",
      "confidence_score": 0.92,
      "created_at": "2024-01-15T15:00:00.000Z"
    },
    {
      "id": 1,
      "stress_level": "Moderate Risk",
      "confidence_score": 0.87,
      "created_at": "2024-01-10T10:00:00.000Z"
    }
  ],
  "total": 2,
  "pages": 1,
  "current_page": 1
}
```

---

### Get Specific Assessment

Returns detailed information about a specific assessment.

**Endpoint:** `GET /api/assessment/:id`

**Authentication:** Required

**Success Response (200):**
```json
{
  "assessment": {
    "id": 1,
    "user_id": 1,
    "assessment_data": { },
    "stress_level": "Moderate Risk",
    "confidence_score": 0.87,
    "all_probabilities": { },
    "top_contributors": [ ],
    "recommendations": [ ],
    "created_at": "2024-01-15T15:00:00.000Z",
    "notes": "Feeling better after following recommendations"
  }
}
```

**Error Responses:**
- `404`: Assessment not found
- `500`: Failed to get assessment

---

### Get Stress Trends

Returns stress level trends over specified time period.

**Endpoint:** `GET /api/assessment/trends`

**Authentication:** Required

**Query Parameters:**
- `days` (optional, default: 180): Number of days to analyze

**Example:** `GET /api/assessment/trends?days=90`

**Success Response (200):**
```json
{
  "trends": [
    {
      "date": "2024-01-15T15:00:00.000Z",
      "stress_level": "Moderate Risk",
      "confidence": 0.87,
      "probabilities": {
        "Low Risk": 0.05,
        "Moderate Risk": 0.87,
        "High Risk": 0.08
      }
    }
  ],
  "statistics": {
    "total_assessments": 5,
    "low_risk_percentage": 40.0,
    "moderate_risk_percentage": 40.0,
    "high_risk_percentage": 20.0,
    "latest_stress_level": "Moderate Risk"
  }
}
```

---

### Get Feature Importance

Returns overall feature importance from the ML model.

**Endpoint:** `GET /api/assessment/feature-importance`

**Authentication:** Required

**Success Response (200):**
```json
{
  "feature_importance": [
    {
      "feature": "anxiety_level",
      "importance": 0.18
    },
    {
      "feature": "depression",
      "importance": 0.15
    },
    {
      "feature": "sleep_quality",
      "importance": 0.12
    }
  ]
}
```

---

### Update Assessment Notes

Updates notes for a specific assessment.

**Endpoint:** `PUT /api/assessment/:id/notes`

**Authentication:** Required

**Request Body:**
```json
{
  "notes": "Started implementing recommendations. Feeling improvement."
}
```

**Success Response (200):**
```json
{
  "message": "Notes updated successfully",
  "assessment": { }
}
```

---

## Admin Endpoints

All admin endpoints require authentication with admin or counselor role.

### Get Dashboard Statistics

Returns system-wide statistics for admin dashboard.

**Endpoint:** `GET /api/admin/dashboard`

**Authentication:** Required (Admin/Counselor)

**Success Response (200):**
```json
{
  "total_users": 150,
  "total_assessments": 450,
  "recent_assessments": 45,
  "high_risk_students": 8,
  "stress_distribution": {
    "low_risk": 200,
    "moderate_risk": 180,
    "high_risk": 70
  },
  "trend_data": [
    {
      "date": "2024-01-15",
      "count": 12
    }
  ],
  "average_confidence": 0.8523
}
```

**Error Responses:**
- `403`: Admin or counselor access required
- `500`: Failed to get dashboard stats

---

### Get All Users

Returns paginated list of all users with assessment summaries.

**Endpoint:** `GET /api/admin/users`

**Authentication:** Required (Admin/Counselor)

**Query Parameters:**
- `page` (optional, default: 1)
- `per_page` (optional, default: 20)

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "email": "student@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "student",
      "created_at": "2024-01-15T10:30:00.000Z",
      "assessment_count": 5,
      "latest_stress_level": "Moderate Risk",
      "latest_assessment_date": "2024-01-15T15:00:00.000Z"
    }
  ],
  "total": 150,
  "pages": 8,
  "current_page": 1
}
```

---

### Get User Assessments

Returns all assessments for a specific user.

**Endpoint:** `GET /api/admin/users/:userId/assessments`

**Authentication:** Required (Admin/Counselor)

**Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "student@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "assessments": [ ],
  "total": 5,
  "pages": 1,
  "current_page": 1
}
```

---

### Get High-Risk Alerts

Returns list of recent high-risk assessments.

**Endpoint:** `GET /api/admin/high-risk-alerts`

**Authentication:** Required (Admin/Counselor)

**Success Response (200):**
```json
{
  "alerts": [
    {
      "assessment_id": 42,
      "user": {
        "id": 15,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "stress_level": "High Risk",
      "confidence": 0.91,
      "date": "2024-01-15T15:00:00.000Z",
      "top_contributors": [
        {
          "feature": "depression",
          "value": 25
        }
      ]
    }
  ]
}
```

---

### Export Data

Exports anonymized assessment data for analysis.

**Endpoint:** `GET /api/admin/export-data`

**Authentication:** Required (Admin/Counselor)

**Success Response (200):**
```json
{
  "data": [
    {
      "anxiety_level": 15,
      "self_esteem": 20,
      "stress_level": "Moderate Risk",
      "confidence_score": 0.87,
      "date": "2024-01-15T15:00:00.000Z"
    }
  ],
  "count": 450
}
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Example Usage

### Python (requests)
```python
import requests

# Register
response = requests.post(
    'http://localhost:5000/api/auth/register',
    json={
        'email': 'test@example.com',
        'password': 'password123',
        'first_name': 'Test',
        'last_name': 'User'
    }
)
token = response.json()['access_token']

# Submit assessment
assessment_data = {
    'anxiety_level': 15,
    'self_esteem': 20,
    # ... other fields
}

response = requests.post(
    'http://localhost:5000/api/assessment/submit',
    json={'assessment_data': assessment_data},
    headers={'Authorization': f'Bearer {token}'}
)
print(response.json())
```

### JavaScript (axios)
```javascript
import axios from 'axios';

// Register
const registerResponse = await axios.post(
  'http://localhost:5000/api/auth/register',
  {
    email: 'test@example.com',
    password: 'password123',
    first_name: 'Test',
    last_name: 'User'
  }
);

const token = registerResponse.data.access_token;

// Submit assessment
const assessmentData = {
  anxiety_level: 15,
  self_esteem: 20,
  // ... other fields
};

const assessmentResponse = await axios.post(
  'http://localhost:5000/api/assessment/submit',
  { assessment_data: assessmentData },
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

console.log(assessmentResponse.data);
```

### cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login and get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.access_token')

# Submit assessment
curl -X POST http://localhost:5000/api/assessment/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "assessment_data": {
      "anxiety_level": 15,
      "self_esteem": 20
    }
  }'
```
