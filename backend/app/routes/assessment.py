"""
Assessment Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, limiter
from app.models import User, Assessment
from app.ml_service import get_ml_service
from app.recommendation_engine import get_recommendations
from datetime import datetime, timedelta
from sqlalchemy import func

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/submit', methods=['POST'])
@jwt_required()
@limiter.limit("10 per hour")
def submit_assessment():
    """Submit a new stress assessment"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        assessment_data = data.get('assessment_data')

        if not assessment_data:
            return jsonify({'error': 'Assessment data is required'}), 400

        # Get ML service
        ml_service = get_ml_service()

        # Make prediction
        prediction_result = ml_service.predict(assessment_data)

        # Generate recommendations
        recommendations = get_recommendations(
            assessment_data,
            prediction_result['stress_level'],
            prediction_result['top_contributors']
        )

        # Create assessment record
        assessment = Assessment(user_id=user_id)
        assessment.set_assessment_data(assessment_data)
        assessment.stress_level = prediction_result['stress_level']
        assessment.confidence_score = prediction_result['confidence']
        assessment.set_probabilities(prediction_result['all_probabilities'])
        assessment.set_top_contributors(prediction_result['top_contributors'])
        assessment.set_recommendations(recommendations)

        db.session.add(assessment)
        db.session.commit()

        return jsonify({
            'message': 'Assessment submitted successfully',
            'assessment': assessment.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Assessment submission failed: {str(e)}'}), 500

@assessment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_assessment_history():
    """Get user's assessment history"""
    try:
        user_id = int(get_jwt_identity())  # Convert string back to int

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Get assessments with SQLAlchemy 2.0 syntax
        from sqlalchemy import select
        query = select(Assessment).filter_by(user_id=user_id).order_by(Assessment.created_at.desc())
        assessments_paginated = db.paginate(query, page=page, per_page=per_page, error_out=False)

        return jsonify({
            'assessments': [a.to_dict() for a in assessments_paginated.items],
            'total': assessments_paginated.total,
            'pages': assessments_paginated.pages,
            'current_page': page
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

@assessment_bp.route('/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    """Get a specific assessment"""
    try:
        user_id = int(get_jwt_identity())

        assessment = Assessment.query.filter_by(
            id=assessment_id,
            user_id=user_id
        ).first()

        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404

        return jsonify({'assessment': assessment.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get assessment: {str(e)}'}), 500

@assessment_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_stress_trends():
    """Get stress level trends over time"""
    try:
        user_id = int(get_jwt_identity())

        # Get time range (default: last 6 months)
        days = request.args.get('days', 180, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)

        # Get assessments in time range
        assessments = Assessment.query.filter(
            Assessment.user_id == user_id,
            Assessment.created_at >= start_date
        ).order_by(Assessment.created_at).all()

        # Format for charting
        trends = []
        for assessment in assessments:
            trends.append({
                'date': assessment.created_at.isoformat(),
                'stress_level': assessment.stress_level,
                'confidence': assessment.confidence_score,
                'probabilities': assessment.get_probabilities()
            })

        # Calculate statistics
        total = len(assessments)
        if total > 0:
            low_count = sum(1 for a in assessments if a.stress_level == 'Low Risk')
            moderate_count = sum(1 for a in assessments if a.stress_level == 'Moderate Risk')
            high_count = sum(1 for a in assessments if a.stress_level == 'High Risk')

            stats = {
                'total_assessments': total,
                'low_risk_percentage': (low_count / total) * 100,
                'moderate_risk_percentage': (moderate_count / total) * 100,
                'high_risk_percentage': (high_count / total) * 100,
                'latest_stress_level': assessments[-1].stress_level if assessments else None
            }
        else:
            stats = {
                'total_assessments': 0,
                'low_risk_percentage': 0,
                'moderate_risk_percentage': 0,
                'high_risk_percentage': 0,
                'latest_stress_level': None
            }

        return jsonify({
            'trends': trends,
            'statistics': stats
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get trends: {str(e)}'}), 500

@assessment_bp.route('/feature-importance', methods=['GET'])
@jwt_required()
def get_feature_importance():
    """Get overall feature importance from the model"""
    try:
        ml_service = get_ml_service()
        importance = ml_service.get_feature_importance_summary()

        return jsonify({'feature_importance': importance}), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get feature importance: {str(e)}'}), 500

@assessment_bp.route('/<int:assessment_id>/notes', methods=['PUT'])
@jwt_required()
def update_notes(assessment_id):
    """Update assessment notes"""
    try:
        user_id = int(get_jwt_identity())

        assessment = Assessment.query.filter_by(
            id=assessment_id,
            user_id=user_id
        ).first()

        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404

        data = request.get_json()
        notes = data.get('notes', '')

        assessment.notes = notes
        db.session.commit()

        return jsonify({
            'message': 'Notes updated successfully',
            'assessment': assessment.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update notes: {str(e)}'}), 500


@assessment_bp.route('/<int:assessment_id>', methods=['DELETE'])
@jwt_required()
def delete_assessment(assessment_id):
    """Delete a specific assessment"""
    try:
        user_id = int(get_jwt_identity())

        assessment = Assessment.query.filter_by(
            id=assessment_id,
            user_id=user_id
        ).first()

        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404

        db.session.delete(assessment)
        db.session.commit()

        return jsonify({'message': 'Assessment deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to delete assessment: {str(e)}'}), 500


@assessment_bp.route('/export', methods=['GET'])
@jwt_required()
def export_assessments():
    """Export all user assessments as JSON or CSV"""
    try:
        user_id = int(get_jwt_identity())
        export_format = request.args.get('format', 'json')

        assessments = Assessment.query.filter_by(user_id=user_id)\
            .order_by(Assessment.created_at.desc()).all()

        if export_format == 'csv':
            import csv
            import io

            output = io.StringIO()
            writer = csv.writer(output)

            # Header row
            writer.writerow([
                'ID', 'Date', 'Stress Level', 'Confidence',
                'Anxiety Level', 'Depression', 'Self Esteem', 'Sleep Quality',
                'Study Load', 'Academic Performance', 'Social Support',
                'Notes'
            ])

            # Data rows
            for a in assessments:
                data = a.get_assessment_data()
                writer.writerow([
                    a.id,
                    a.created_at.isoformat(),
                    a.stress_level,
                    f"{a.confidence_score:.2%}",
                    data.get('anxiety_level', ''),
                    data.get('depression', ''),
                    data.get('self_esteem', ''),
                    data.get('sleep_quality', ''),
                    data.get('study_load', ''),
                    data.get('academic_performance', ''),
                    data.get('social_support', ''),
                    a.notes or ''
                ])

            csv_content = output.getvalue()
            output.close()

            return jsonify({
                'format': 'csv',
                'data': csv_content,
                'filename': f'stress_assessments_{datetime.utcnow().strftime("%Y%m%d")}.csv'
            }), 200

        else:  # JSON format
            return jsonify({
                'format': 'json',
                'data': [a.to_dict() for a in assessments],
                'total': len(assessments),
                'exported_at': datetime.utcnow().isoformat()
            }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to export assessments: {str(e)}'}), 500


@assessment_bp.route('/compare/<int:id1>/<int:id2>', methods=['GET'])
@jwt_required()
def compare_assessments(id1, id2):
    """Compare two assessments side by side"""
    try:
        user_id = int(get_jwt_identity())

        assessment1 = Assessment.query.filter_by(id=id1, user_id=user_id).first()
        assessment2 = Assessment.query.filter_by(id=id2, user_id=user_id).first()

        if not assessment1 or not assessment2:
            return jsonify({'error': 'One or both assessments not found'}), 404

        data1 = assessment1.get_assessment_data()
        data2 = assessment2.get_assessment_data()

        # Calculate differences for each feature
        differences = {}
        for key in data1.keys():
            if key in data2:
                diff = data2.get(key, 0) - data1.get(key, 0)
                differences[key] = {
                    'before': data1.get(key),
                    'after': data2.get(key),
                    'change': diff,
                    'improved': diff < 0 if key in ['anxiety_level', 'depression', 'stress_level',
                                                      'peer_pressure', 'bullying', 'noise_level',
                                                      'study_load', 'headache', 'blood_pressure',
                                                      'breathing_problem', 'future_career_concerns'] else diff > 0
                }

        # Determine overall improvement
        stress_levels = {'Low Risk': 0, 'Moderate Risk': 1, 'High Risk': 2}
        stress_change = stress_levels.get(assessment2.stress_level, 1) - stress_levels.get(assessment1.stress_level, 1)

        return jsonify({
            'assessment1': {
                'id': assessment1.id,
                'date': assessment1.created_at.isoformat(),
                'stress_level': assessment1.stress_level,
                'confidence': assessment1.confidence_score,
                'data': data1
            },
            'assessment2': {
                'id': assessment2.id,
                'date': assessment2.created_at.isoformat(),
                'stress_level': assessment2.stress_level,
                'confidence': assessment2.confidence_score,
                'data': data2
            },
            'differences': differences,
            'overall_change': {
                'stress_improved': stress_change < 0,
                'stress_worsened': stress_change > 0,
                'stress_unchanged': stress_change == 0,
                'days_between': (assessment2.created_at - assessment1.created_at).days
            }
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to compare assessments: {str(e)}'}), 500


@assessment_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Get weekly/monthly summary statistics"""
    try:
        user_id = int(get_jwt_identity())
        period = request.args.get('period', 'week')  # 'week', 'month', 'year'

        # Calculate date range
        now = datetime.utcnow()
        if period == 'week':
            start_date = now - timedelta(days=7)
            period_label = 'Last 7 Days'
        elif period == 'month':
            start_date = now - timedelta(days=30)
            period_label = 'Last 30 Days'
        elif period == 'year':
            start_date = now - timedelta(days=365)
            period_label = 'Last 12 Months'
        else:
            start_date = now - timedelta(days=7)
            period_label = 'Last 7 Days'

        # Get assessments in period
        assessments = Assessment.query.filter(
            Assessment.user_id == user_id,
            Assessment.created_at >= start_date
        ).order_by(Assessment.created_at).all()

        if not assessments:
            return jsonify({
                'period': period_label,
                'summary': {
                    'total_assessments': 0,
                    'message': 'No assessments found in this period'
                }
            }), 200

        # Calculate statistics
        total = len(assessments)
        low_count = sum(1 for a in assessments if a.stress_level == 'Low Risk')
        moderate_count = sum(1 for a in assessments if a.stress_level == 'Moderate Risk')
        high_count = sum(1 for a in assessments if a.stress_level == 'High Risk')
        avg_confidence = sum(a.confidence_score for a in assessments) / total

        # Calculate average values for key metrics
        avg_metrics = {}
        metric_keys = ['anxiety_level', 'depression', 'self_esteem', 'sleep_quality',
                       'study_load', 'social_support']

        for key in metric_keys:
            values = [a.get_assessment_data().get(key, 0) for a in assessments]
            avg_metrics[key] = sum(values) / len(values) if values else 0

        # Trend analysis (comparing first half to second half of period)
        mid_point = len(assessments) // 2
        if mid_point > 0:
            first_half = assessments[:mid_point]
            second_half = assessments[mid_point:]

            first_avg = sum(1 for a in first_half if a.stress_level == 'High Risk') / len(first_half)
            second_avg = sum(1 for a in second_half if a.stress_level == 'High Risk') / len(second_half)

            if second_avg < first_avg:
                trend = 'improving'
            elif second_avg > first_avg:
                trend = 'worsening'
            else:
                trend = 'stable'
        else:
            trend = 'insufficient_data'

        # Most common contributors
        all_contributors = []
        for a in assessments:
            contributors = a.get_top_contributors()
            if contributors:
                all_contributors.extend([c['feature'] for c in contributors[:3]])

        from collections import Counter
        top_factors = Counter(all_contributors).most_common(5)

        return jsonify({
            'period': period_label,
            'date_range': {
                'start': start_date.isoformat(),
                'end': now.isoformat()
            },
            'summary': {
                'total_assessments': total,
                'stress_distribution': {
                    'low_risk': {'count': low_count, 'percentage': (low_count / total) * 100},
                    'moderate_risk': {'count': moderate_count, 'percentage': (moderate_count / total) * 100},
                    'high_risk': {'count': high_count, 'percentage': (high_count / total) * 100}
                },
                'average_confidence': avg_confidence,
                'trend': trend,
                'average_metrics': avg_metrics,
                'top_stress_factors': [{'factor': f, 'occurrences': c} for f, c in top_factors],
                'latest_assessment': assessments[-1].to_dict() if assessments else None
            }
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get summary: {str(e)}'}), 500


@assessment_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_personalized_insights():
    """Get personalized insights based on assessment history"""
    try:
        user_id = int(get_jwt_identity())

        # Get all assessments
        assessments = Assessment.query.filter_by(user_id=user_id)\
            .order_by(Assessment.created_at.desc()).all()

        if len(assessments) < 2:
            return jsonify({
                'insights': [],
                'message': 'Need at least 2 assessments for personalized insights'
            }), 200

        insights = []

        # Insight 1: Overall trend
        recent_5 = assessments[:5]
        stress_levels = {'Low Risk': 0, 'Moderate Risk': 1, 'High Risk': 2}
        recent_avg = sum(stress_levels.get(a.stress_level, 1) for a in recent_5) / len(recent_5)

        if len(assessments) > 5:
            older_5 = assessments[5:10]
            older_avg = sum(stress_levels.get(a.stress_level, 1) for a in older_5) / len(older_5)

            if recent_avg < older_avg - 0.3:
                insights.append({
                    'type': 'positive',
                    'title': 'Great Progress!',
                    'message': 'Your stress levels have been improving compared to earlier assessments.',
                    'icon': 'trending_down'
                })
            elif recent_avg > older_avg + 0.3:
                insights.append({
                    'type': 'warning',
                    'title': 'Stress Increasing',
                    'message': 'Your recent stress levels are higher than before. Consider reviewing your coping strategies.',
                    'icon': 'trending_up'
                })

        # Insight 2: Consistency
        if len(recent_5) >= 3:
            consistent = all(a.stress_level == recent_5[0].stress_level for a in recent_5[:3])
            if consistent and recent_5[0].stress_level == 'Low Risk':
                insights.append({
                    'type': 'positive',
                    'title': 'Consistently Low Stress',
                    'message': 'You\'ve maintained low stress levels! Keep up the great work.',
                    'icon': 'check_circle'
                })
            elif consistent and recent_5[0].stress_level == 'High Risk':
                insights.append({
                    'type': 'alert',
                    'title': 'Persistent High Stress',
                    'message': 'Your stress has been consistently high. Please consider speaking with a counselor.',
                    'icon': 'warning'
                })

        # Insight 3: Most impactful factors
        all_contributors = []
        for a in assessments[:10]:
            contributors = a.get_top_contributors()
            if contributors:
                all_contributors.extend(contributors[:2])

        if all_contributors:
            from collections import Counter
            factor_counts = Counter([c['feature'] for c in all_contributors])
            top_factor = factor_counts.most_common(1)[0][0]

            factor_labels = {
                'anxiety_level': 'Anxiety',
                'depression': 'Depression',
                'self_esteem': 'Self-esteem',
                'sleep_quality': 'Sleep quality',
                'study_load': 'Study load',
                'social_support': 'Social support',
                'mental_composite': 'Overall mental health',
                'academic_stress': 'Academic stress',
                'social_wellbeing': 'Social wellbeing'
            }

            insights.append({
                'type': 'info',
                'title': 'Key Stress Factor',
                'message': f'{factor_labels.get(top_factor, top_factor)} appears frequently as a stress contributor. Focus on this area for improvement.',
                'icon': 'lightbulb'
            })

        # Insight 4: Assessment frequency
        if len(assessments) >= 2:
            days_between = (assessments[0].created_at - assessments[1].created_at).days
            if days_between > 14:
                insights.append({
                    'type': 'reminder',
                    'title': 'Regular Check-ins',
                    'message': 'Consider taking assessments more frequently (weekly) to better track your mental health.',
                    'icon': 'schedule'
                })

        return jsonify({
            'insights': insights,
            'assessment_count': len(assessments),
            'generated_at': datetime.utcnow().isoformat()
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get insights: {str(e)}'}), 500


@assessment_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_assessment_streak():
    """Get user's assessment streak and achievements"""
    try:
        user_id = int(get_jwt_identity())

        assessments = Assessment.query.filter_by(user_id=user_id)\
            .order_by(Assessment.created_at.desc()).all()

        if not assessments:
            return jsonify({
                'current_streak': 0,
                'longest_streak': 0,
                'total_assessments': 0,
                'achievements': []
            }), 200

        # Calculate weekly streak
        current_streak = 0
        longest_streak = 0
        temp_streak = 0

        # Group by week
        weeks_with_assessments = set()
        for a in assessments:
            week_num = a.created_at.isocalendar()[1]
            year = a.created_at.year
            weeks_with_assessments.add((year, week_num))

        # Count consecutive weeks (simplified)
        total = len(assessments)

        # Achievements
        achievements = []

        if total >= 1:
            achievements.append({
                'id': 'first_step',
                'title': 'First Step',
                'description': 'Completed your first assessment',
                'icon': 'star',
                'earned': True
            })

        if total >= 5:
            achievements.append({
                'id': 'getting_started',
                'title': 'Getting Started',
                'description': 'Completed 5 assessments',
                'icon': 'emoji_events',
                'earned': True
            })

        if total >= 10:
            achievements.append({
                'id': 'committed',
                'title': 'Committed',
                'description': 'Completed 10 assessments',
                'icon': 'military_tech',
                'earned': True
            })

        if total >= 25:
            achievements.append({
                'id': 'dedicated',
                'title': 'Dedicated',
                'description': 'Completed 25 assessments',
                'icon': 'workspace_premium',
                'earned': True
            })

        # Check for improvement achievement
        if len(assessments) >= 3:
            recent = assessments[0]
            oldest = assessments[-1]
            if recent.stress_level == 'Low Risk' and oldest.stress_level == 'High Risk':
                achievements.append({
                    'id': 'overcomer',
                    'title': 'Overcomer',
                    'description': 'Improved from High Risk to Low Risk',
                    'icon': 'trending_up',
                    'earned': True
                })

        return jsonify({
            'current_streak': len(weeks_with_assessments),
            'total_assessments': total,
            'weeks_active': len(weeks_with_assessments),
            'achievements': achievements,
            'next_achievement': {
                'assessments_needed': (5 if total < 5 else 10 if total < 10 else 25 if total < 25 else 50) - total,
                'next_milestone': 5 if total < 5 else 10 if total < 10 else 25 if total < 25 else 50
            }
        }), 200

    except Exception as e:
        return jsonify({'error': f'Failed to get streak: {str(e)}'}), 500
