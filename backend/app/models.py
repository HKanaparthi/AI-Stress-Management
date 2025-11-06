"""
Database Models
"""

from app import db, bcrypt
from datetime import datetime
import json

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), default='student')  # student, counselor, admin
    profile_picture = db.Column(db.String(100), default='photo1.jpg')  # Avatar filename
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    assessments = db.relationship('Assessment', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Check if password matches"""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class Assessment(db.Model):
    """Assessment model for storing stress assessments"""
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Assessment data (stored as JSON for flexibility)
    assessment_data = db.Column(db.Text, nullable=False)  # JSON string of all input features

    # Prediction results
    stress_level = db.Column(db.String(50), nullable=False)  # Low Risk, Moderate Risk, High Risk
    confidence_score = db.Column(db.Float, nullable=False)
    all_probabilities = db.Column(db.Text, nullable=False)  # JSON string

    # Feature importance for this prediction
    top_contributors = db.Column(db.Text)  # JSON string of top stress contributors

    # Recommendations
    recommendations = db.Column(db.Text)  # JSON string of recommendations

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    notes = db.Column(db.Text)

    def set_assessment_data(self, data):
        """Set assessment data as JSON"""
        self.assessment_data = json.dumps(data)

    def get_assessment_data(self):
        """Get assessment data from JSON"""
        return json.loads(self.assessment_data)

    def set_probabilities(self, probs):
        """Set probability scores as JSON"""
        self.all_probabilities = json.dumps(probs)

    def get_probabilities(self):
        """Get probability scores from JSON"""
        return json.loads(self.all_probabilities)

    def set_top_contributors(self, contributors):
        """Set top contributors as JSON"""
        self.top_contributors = json.dumps(contributors)

    def get_top_contributors(self):
        """Get top contributors from JSON"""
        return json.loads(self.top_contributors) if self.top_contributors else []

    def set_recommendations(self, recs):
        """Set recommendations as JSON"""
        self.recommendations = json.dumps(recs)

    def get_recommendations(self):
        """Get recommendations from JSON"""
        return json.loads(self.recommendations) if self.recommendations else []

    def to_dict(self):
        """Convert assessment to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assessment_data': self.get_assessment_data(),
            'stress_level': self.stress_level,
            'confidence_score': self.confidence_score,
            'all_probabilities': self.get_probabilities(),
            'top_contributors': self.get_top_contributors(),
            'recommendations': self.get_recommendations(),
            'created_at': self.created_at.isoformat(),
            'notes': self.notes
        }

class SystemMetrics(db.Model):
    """System metrics for admin dashboard"""
    __tablename__ = 'system_metrics'

    id = db.Column(db.Integer, primary_key=True)
    total_users = db.Column(db.Integer, default=0)
    total_assessments = db.Column(db.Integer, default=0)
    high_risk_count = db.Column(db.Integer, default=0)
    moderate_risk_count = db.Column(db.Integer, default=0)
    low_risk_count = db.Column(db.Integer, default=0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        """Convert metrics to dictionary"""
        return {
            'id': self.id,
            'total_users': self.total_users,
            'total_assessments': self.total_assessments,
            'high_risk_count': self.high_risk_count,
            'moderate_risk_count': self.moderate_risk_count,
            'low_risk_count': self.low_risk_count,
            'timestamp': self.timestamp.isoformat()
        }
