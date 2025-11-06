"""
Admin Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Assessment, SystemMetrics
from datetime import datetime, timedelta
from sqlalchemy import func, case
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or user.role not in ['admin', 'counselor']:
            return jsonify({'error': 'Admin or counselor access required'}), 403

        return fn(*args, **kwargs)

    return wrapper

@admin_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Total users
        total_users = User.query.count()

        # Total assessments
        total_assessments = Assessment.query.count()

        # Stress level distribution
        stress_distribution = db.session.query(
            Assessment.stress_level,
            func.count(Assessment.id)
        ).group_by(Assessment.stress_level).all()

        distribution_dict = {level: count for level, count in stress_distribution}

        # Recent assessments (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_assessments = Assessment.query.filter(
            Assessment.created_at >= thirty_days_ago
        ).count()

        # High-risk students (last assessment)
        # Get latest assessment for each user
        subquery = db.session.query(
            Assessment.user_id,
            func.max(Assessment.created_at).label('max_date')
        ).group_by(Assessment.user_id).subquery()

        high_risk_students = db.session.query(Assessment).join(
            subquery,
            db.and_(
                Assessment.user_id == subquery.c.user_id,
                Assessment.created_at == subquery.c.max_date,
                Assessment.stress_level == 'High Risk'
            )
        ).count()

        # Trend data (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        daily_assessments = db.session.query(
            func.date(Assessment.created_at).label('date'),
            func.count(Assessment.id).label('count')
        ).filter(
            Assessment.created_at >= seven_days_ago
        ).group_by(
            func.date(Assessment.created_at)
        ).all()

        trend_data = [
            {'date': str(date), 'count': count}
            for date, count in daily_assessments
        ]

        # Average confidence score
        avg_confidence = db.session.query(
            func.avg(Assessment.confidence_score)
        ).scalar() or 0

        return jsonify({
            'total_users': total_users,
            'total_assessments': total_assessments,
            'recent_assessments': recent_assessments,
            'high_risk_students': high_risk_students,
            'stress_distribution': {
                'low_risk': distribution_dict.get('Low Risk', 0),
                'moderate_risk': distribution_dict.get('Moderate Risk', 0),
                'high_risk': distribution_dict.get('High Risk', 0)
            },
            'trend_data': trend_data,
            'average_confidence': round(avg_confidence, 4)
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get dashboard stats: {str(e)}'}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users with pagination"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        users = User.query.order_by(User.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)

        # Get assessment count for each user
        users_data = []
        for user in users.items:
            assessment_count = Assessment.query.filter_by(user_id=user.id).count()

            # Get latest assessment
            latest_assessment = Assessment.query.filter_by(user_id=user.id)\
                .order_by(Assessment.created_at.desc()).first()

            user_dict = user.to_dict()
            user_dict['assessment_count'] = assessment_count
            user_dict['latest_stress_level'] = latest_assessment.stress_level if latest_assessment else None
            user_dict['latest_assessment_date'] = latest_assessment.created_at.isoformat() if latest_assessment else None

            users_data.append(user_dict)

        return jsonify({
            'users': users_data,
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get users: {str(e)}'}), 500

@admin_bp.route('/users/<int:user_id>/assessments', methods=['GET'])
@admin_required
def get_user_assessments(user_id):
    """Get all assessments for a specific user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        assessments = Assessment.query.filter_by(user_id=user_id)\
            .order_by(Assessment.created_at.desc())\
            .paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            'user': user.to_dict(),
            'assessments': [a.to_dict() for a in assessments.items],
            'total': assessments.total,
            'pages': assessments.pages,
            'current_page': page
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get user assessments: {str(e)}'}), 500

@admin_bp.route('/high-risk-alerts', methods=['GET'])
@admin_required
def get_high_risk_alerts():
    """Get list of students with high-risk assessments"""
    try:
        # Get recent high-risk assessments (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)

        high_risk_assessments = db.session.query(
            Assessment, User
        ).join(
            User, Assessment.user_id == User.id
        ).filter(
            Assessment.stress_level == 'High Risk',
            Assessment.created_at >= seven_days_ago
        ).order_by(
            Assessment.created_at.desc()
        ).all()

        alerts = []
        for assessment, user in high_risk_assessments:
            alerts.append({
                'assessment_id': assessment.id,
                'user': {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email
                },
                'stress_level': assessment.stress_level,
                'confidence': assessment.confidence_score,
                'date': assessment.created_at.isoformat(),
                'top_contributors': assessment.get_top_contributors()[:3]
            })

        return jsonify({'alerts': alerts}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get high-risk alerts: {str(e)}'}), 500

@admin_bp.route('/export-data', methods=['GET'])
@admin_required
def export_data():
    """Export aggregated data for analysis"""
    try:
        # Get all assessments with anonymized user data
        assessments = Assessment.query.all()

        export_data = []
        for assessment in assessments:
            data = assessment.get_assessment_data()
            data['stress_level'] = assessment.stress_level
            data['confidence_score'] = assessment.confidence_score
            data['date'] = assessment.created_at.isoformat()

            export_data.append(data)

        return jsonify({
            'data': export_data,
            'count': len(export_data)
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to export data: {str(e)}'}), 500
