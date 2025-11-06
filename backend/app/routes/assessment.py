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
        print(f"Received data: {data}")  # Debug log
        assessment_data = data.get('assessment_data')

        if not assessment_data:
            return jsonify({'error': 'Assessment data is required'}), 400

        print(f"Assessment data: {assessment_data}")  # Debug log

        # Get ML service
        ml_service = get_ml_service()

        # Make prediction
        prediction_result = ml_service.predict(assessment_data)
        print(f"Prediction result: {prediction_result}")  # Debug log

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
        print(f"Error in submit_assessment: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Assessment submission failed: {str(e)}'}), 500

@assessment_bp.route('/history', methods=['GET'])
@jwt_required()
def get_assessment_history():
    """Get user's assessment history"""
    try:
        jwt_identity = get_jwt_identity()
        print(f"=== DEBUG get_assessment_history ===")
        print(f"JWT Identity (raw): {jwt_identity}, Type: {type(jwt_identity)}")
        user_id = int(jwt_identity)  # Convert string back to int
        print(f"User ID (converted): {user_id}")

        # Pagination
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        print(f"Page: {page}, Per page: {per_page}")

        # Get assessments with SQLAlchemy 2.0 syntax
        from sqlalchemy import select
        query = select(Assessment).filter_by(user_id=user_id).order_by(Assessment.created_at.desc())
        assessments_paginated = db.paginate(query, page=page, per_page=per_page, error_out=False)

        print(f"Found {assessments_paginated.total} assessments for user {user_id}")
        print(f"Items on this page: {len(assessments_paginated.items)}")

        return jsonify({
            'assessments': [a.to_dict() for a in assessments_paginated.items],
            'total': assessments_paginated.total,
            'pages': assessments_paginated.pages,
            'current_page': page
        }), 200

    except Exception as e:
        print(f"Error in get_assessment_history: {str(e)}")
        import traceback
        traceback.print_exc()
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
