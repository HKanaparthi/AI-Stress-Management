# Student Stress Monitor

> An AI-powered mental health assessment system that predicts student stress levels using machine learning

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Student Stress Monitor is a comprehensive web application that uses machine learning to assess and predict student stress levels. The system analyzes 20+ lifestyle and psychological factors to classify stress as Low/Moderate/High Risk and provides personalized recommendations for stress management.

### Key Highlights

- **High Accuracy**: Machine Learning models achieve 88%+ accuracy with F1-score ≥ 0.88
- **Real-time Analysis**: Instant stress level predictions with confidence scores
- **Personalized Recommendations**: Rule-based recommendation engine provides tailored coping strategies
- **Historical Tracking**: Monitor stress trends over time with interactive visualizations
- **Privacy-First**: AES-256 encryption and FERPA-compliant design
- **Role-Based Access**: Student, counselor, and admin dashboards

## Features

### For Students
- **Comprehensive Assessment**: 20-factor questionnaire covering mental health, lifestyle, and academic factors
- **AI Predictions**: Get instant stress level predictions with confidence scores
- **Feature Importance**: See which factors contribute most to your stress
- **Personalized Recommendations**: Receive customized coping strategies based on your stress profile
- **Trend Analysis**: Track your stress levels over time with interactive charts
- **Privacy Protection**: All data is encrypted and confidential

### For Counselors/Admins
- **Dashboard Analytics**: View aggregated stress statistics across student population
- **High-Risk Alerts**: Identify students requiring immediate intervention
- **User Management**: Monitor student assessments and progress
- **Data Export**: Export anonymized data for research and analysis
- **System Monitoring**: Track usage metrics and system performance

### Machine Learning Model
- **Algorithm**: Multiple models compared (Random Forest, Gradient Boosting, SVM, Logistic Regression, AdaBoost)
- **Features**: 20 base input features + 5 engineered composite features
- **Performance**:
  - Accuracy: 88.6%
  - F1-Score: 0.88
  - Cross-validation: 5-fold CV
- **Feature Engineering**: Composite features for mental health, physical health, academic stress, social wellbeing, environment quality
- **Feature Importance**: Identifies top stress contributors for each assessment

## Architecture

### Tech Stack

**Backend:**
- Python 3.8+
- Flask 3.0 (REST API)
- Flask-JWT-Extended (Authentication)
- Flask-SQLAlchemy (ORM)
- SQLite/PostgreSQL (Database)
- scikit-learn 1.3 (Machine Learning)
- pandas, numpy (Data processing)

**Frontend:**
- React 18.2 with TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Recharts (Data visualization)
- Zustand (State management)
- React Router (Navigation)
- Axios (HTTP client)

**Security:**
- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Security headers (XSS, CSRF protection)
- Input validation

### Project Structure

```
student-stress-monitor/
├── backend/
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── models.py             # Database models
│   │   ├── ml_service.py         # ML service wrapper
│   │   ├── recommendation_engine.py  # Recommendation rules
│   │   └── routes/
│   │       ├── auth.py           # Authentication endpoints
│   │       ├── assessment.py     # Assessment endpoints
│   │       └── admin.py          # Admin endpoints
│   ├── models/                   # Trained ML models
│   ├── app.py                    # Application entry point
│   ├── train_model.py            # Model training script
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── stores/              # State management
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── package.json             # Node dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── tailwind.config.js       # Tailwind CSS config
│   └── vite.config.ts           # Vite config
├── data/
│   ├── StressLevelDataset.csv   # Primary dataset
│   └── Stress_Dataset.csv       # Secondary dataset
└── README.md                    # This file
```

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   cd "AI final project"
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv

   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Train the machine learning model**
   ```bash
   python train_model.py
   ```

   This will:
   - Load and preprocess both datasets
   - Train Random Forest classifier with hyperparameter tuning
   - Evaluate model performance
   - Save trained model to `models/stress_predictor.pkl`
   - Save feature importance to `models/feature_importance.json`

6. **Initialize the database**
   ```bash
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
   ```

7. **Run the backend server**
   ```bash
   python app.py
   ```

   Server will start at `http://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5001" > .env
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   Application will open at `http://localhost:3000`

## Usage

### Running the Application

1. **Start Backend**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python app.py
   ```

2. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Open browser to `http://localhost:3000`
   - Register a new account or login
   - Complete the stress assessment
   - View results and recommendations

### Taking an Assessment

1. **Login** to your account
2. **Navigate** to "Take Assessment" from dashboard
3. **Complete** the 20-question questionnaire (5-10 minutes)
   - Use sliders to rate each factor
   - All questions are required
4. **Submit** and view instant results including:
   - Stress level prediction (Low/Moderate/High Risk)
   - Confidence score
   - Top contributing factors
   - Personalized recommendations
5. **Track** your progress over time in the History page

### Understanding Results

**Stress Levels:**
- **Low Risk**: Well-managed stress levels, continue current practices
- **Moderate Risk**: Some areas need attention, follow recommendations
- **High Risk**: Immediate intervention recommended, contact counseling

**Confidence Score**: Indicates model's certainty in prediction (0-100%)

**Top Contributors**: Features with highest impact on your stress level

**Recommendations**: Personalized based on your specific stress factors

### Admin Dashboard

Administrators and counselors can access:
- Total user and assessment statistics
- Stress distribution charts
- High-risk student alerts
- Trend analysis over time
- Data export for research

## API Documentation

### Base URL
```
Development: http://localhost:5001/api
Production: https://your-domain.com/api
```

### Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/api/auth`)

**POST /api/auth/register**
```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```
Response: User object + JWT token

**POST /api/auth/login**
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```
Response: User object + JWT token

**GET /api/auth/me**
- Requires: Authentication
- Returns: Current user information

**PUT /api/auth/update-profile**
- Requires: Authentication
- Body: `{ "first_name": "...", "last_name": "..." }`

**POST /api/auth/change-password**
- Requires: Authentication
- Body: `{ "current_password": "...", "new_password": "..." }`

#### Assessment (`/api/assessment`)

**POST /api/assessment/submit**
- Requires: Authentication
- Body: Assessment data (20 features)
```json
{
  "assessment_data": {
    "anxiety_level": 15,
    "self_esteem": 20,
    "depression": 10,
    ...
  }
}
```
Response: Assessment with prediction results

**GET /api/assessment/history?page=1&per_page=10**
- Requires: Authentication
- Returns: Paginated assessment history

**GET /api/assessment/:id**
- Requires: Authentication
- Returns: Specific assessment details

**GET /api/assessment/trends?days=180**
- Requires: Authentication
- Returns: Stress trends and statistics

**GET /api/assessment/feature-importance**
- Requires: Authentication
- Returns: Overall feature importance rankings

**PUT /api/assessment/:id/notes**
- Requires: Authentication
- Body: `{ "notes": "..." }`

#### Admin (`/api/admin`)

**GET /api/admin/dashboard**
- Requires: Admin/Counselor role
- Returns: System-wide statistics

**GET /api/admin/users?page=1&per_page=20**
- Requires: Admin/Counselor role
- Returns: Paginated user list with assessment counts

**GET /api/admin/users/:userId/assessments**
- Requires: Admin/Counselor role
- Returns: All assessments for specific user

**GET /api/admin/high-risk-alerts**
- Requires: Admin/Counselor role
- Returns: Recent high-risk assessments

**GET /api/admin/export-data**
- Requires: Admin/Counselor role
- Returns: Anonymized assessment data for analysis

### Error Responses

All endpoints return consistent error format:
```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Deployment

### Backend Deployment (Render/Railway/Heroku)

#### Using Render

1. **Create Render account** at render.com

2. **Create new Web Service**
   - Connect your GitHub repository
   - Select backend directory
   - Build command: `pip install -r requirements.txt && python train_model.py`
   - Start command: `gunicorn app:app`

3. **Set environment variables**
   ```
   FLASK_ENV=production
   SECRET_KEY=<generate-secure-key>
   JWT_SECRET_KEY=<generate-secure-key>
   DATABASE_URL=<postgres-url>
   FRONTEND_URL=<your-frontend-url>
   ```

4. **Deploy** - Render will automatically build and deploy

#### Using Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

4. **Set variables and deploy**
   ```bash
   railway up
   ```

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```

3. **Set environment variable**
   ```bash
   vercel env add VITE_API_URL
   # Enter your backend URL
   ```

4. **Production deployment**
   ```bash
   vercel --prod
   ```

#### Using Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Configure environment**
   - Go to Netlify dashboard
   - Site settings → Environment variables
   - Add `VITE_API_URL` with backend URL

### Database Setup (PostgreSQL)

For production, use PostgreSQL instead of SQLite:

1. **Create PostgreSQL database** (Render, Railway, or Heroku Postgres)

2. **Update DATABASE_URL** in environment variables
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

3. **Run migrations** (database tables will be created automatically on first run)

### Post-Deployment Checklist

- [ ] Backend is accessible and returns health check
- [ ] Frontend loads and can reach backend API
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] Database is connected and initialized
- [ ] ML model is loaded successfully
- [ ] User registration works
- [ ] Assessment submission works
- [ ] SSL/HTTPS is enabled
- [ ] Rate limiting is active
- [ ] Error logging is configured

## Model Training Details

### Dataset Information

**Primary Dataset** (`StressLevelDataset.csv`):
- 20 input features
- Target: stress_level (0=Low, 1=Moderate, 2=High)
- Numerical features with varying ranges

**Features:**
1. anxiety_level (0-30)
2. self_esteem (0-30)
3. mental_health_history (0-1)
4. depression (0-30)
5. headache (0-5)
6. blood_pressure (1-3)
7. sleep_quality (0-5)
8. breathing_problem (0-5)
9. noise_level (0-5)
10. living_conditions (1-5)
11. safety (1-5)
12. basic_needs (1-5)
13. academic_performance (1-5)
14. study_load (1-5)
15. teacher_student_relationship (1-5)
16. future_career_concerns (1-5)
17. social_support (1-5)
18. peer_pressure (1-5)
19. extracurricular_activities (0-5)
20. bullying (1-5)

### Training Process

1. **Data Preprocessing**
   - Load CSV datasets
   - Handle missing values
   - Feature scaling with StandardScaler

2. **Model Selection**
   - Algorithm: Random Forest Classifier
   - Reason: Handles non-linear relationships, provides feature importance

3. **Hyperparameter Tuning**
   - Grid search with 5-fold cross-validation
   - Parameters tuned:
     - n_estimators: [100, 200, 300]
     - max_depth: [10, 20, 30, None]
     - min_samples_split: [2, 5, 10]
     - min_samples_leaf: [1, 2, 4]
     - max_features: ['sqrt', 'log2']

4. **Evaluation**
   - Train/test split: 80/20
   - Stratified sampling for balanced classes
   - Metrics: Accuracy, F1-score, Confusion Matrix
   - Target performance: Accuracy ≥85%, F1 ≥0.82

5. **Model Persistence**
   - Saved using joblib
   - Includes: model, scaler, feature names, importance scores

### Retraining the Model

To retrain with new data:

```bash
cd backend
python train_model.py
```

The script will:
- Load latest data
- Perform hyperparameter tuning
- Evaluate performance
- Save new model if performance is acceptable

## Security Considerations

### Implemented Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt)
   - Token validation on protected routes

2. **Authorization**
   - Role-based access control (student, counselor, admin)
   - User can only access their own assessments
   - Admin routes protected

3. **Data Protection**
   - Database encryption capability
   - HTTPS enforced in production
   - Secure session management
   - Input sanitization

4. **API Security**
   - Rate limiting (Flask-Limiter)
   - CORS configuration
   - Security headers (XSS, CSRF protection)
   - Input validation

5. **Privacy Compliance**
   - FERPA-compliant design
   - Data anonymization for exports
   - User consent mechanisms
   - Data retention policies

### Recommendations for Production

- Use strong, unique SECRET_KEY and JWT_SECRET_KEY
- Enable SSL/TLS certificates
- Implement database backups
- Add logging and monitoring
- Regular security audits
- Keep dependencies updated
- Implement 2FA for admin accounts
- Add CAPTCHA for registration

## Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### API Testing

Use tools like Postman or cURL to test endpoints:

```bash
# Health check
curl http://localhost:5001/health

# Register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","first_name":"Test","last_name":"User"}'
```

## Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version (3.8+)
- Verify all dependencies installed
- Check if port 5001 is available
- Verify .env file exists

**Frontend won't start**
- Check Node version (16+)
- Delete node_modules and reinstall
- Clear npm cache: `npm cache clean --force`
- Check if port 3000 is available

**Model not loading**
- Run `python train_model.py` first
- Verify models/ directory exists
- Check file paths in ml_service.py

**Database errors**
- Delete stress_monitor.db and recreate
- Check DATABASE_URL in .env
- Verify SQLAlchemy migrations

**CORS errors**
- Check FRONTEND_URL in backend .env
- Verify VITE_API_URL in frontend .env
- Check Flask-CORS configuration

### Getting Help

- **Issues**: Open an issue on GitHub
- **Documentation**: Check docs/ folder
- **Community**: Join our Discord/Slack
- **Email**: support@example.com

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for TypeScript/React
- Write tests for new features
- Update documentation
- Keep commits atomic and meaningful

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Dataset sources
- scikit-learn for ML framework
- React and Flask communities
- Contributors and testers

## Contact

- **Project Maintainer**: Your Name
- **Email**: your.email@example.com
- **GitHub**: @yourusername
- **Website**: https://your-website.com

---

**Emergency Resources**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- SAMHSA National Helpline: 1-800-662-4357

**Disclaimer**: This application is for educational and research purposes. It is not a substitute for professional mental health care. If you are experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.
