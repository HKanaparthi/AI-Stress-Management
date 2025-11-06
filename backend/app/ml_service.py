"""
Machine Learning Service for Stress Prediction
"""

import joblib
import os
import json
import numpy as np

class MLService:
    """Service for loading and using the ML model"""

    def __init__(self, model_path='models/stress_predictor.pkl'):
        self.model_path = model_path
        self.model = None
        self.scaler = None
        self.feature_names = []
        self.feature_importance = {}
        self.load_model()

    def load_model(self):
        """Load the trained model"""
        try:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at {self.model_path}")

            model_data = joblib.load(self.model_path)

            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.feature_importance = model_data['feature_importance']

            print(f"Model loaded successfully from {self.model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            raise

    def predict(self, features_dict):
        """
        Predict stress level from feature dictionary

        Args:
            features_dict: Dictionary with feature names as keys

        Returns:
            Dictionary with prediction results
        """
        try:
            # Convert dictionary to feature array in correct order
            features = [features_dict.get(name, 0) for name in self.feature_names]

            # Scale features
            features_scaled = self.scaler.transform([features])

            # Get prediction
            prediction = self.model.predict(features_scaled)[0]

            # Get probability scores
            probabilities = self.model.predict_proba(features_scaled)[0]

            # Map prediction to category
            stress_categories = ['Low Risk', 'Moderate Risk', 'High Risk']
            predicted_category = stress_categories[prediction]
            confidence = float(probabilities[prediction])

            # Get all probabilities
            all_probabilities = {
                'Low Risk': float(probabilities[0]),
                'Moderate Risk': float(probabilities[1]),
                'High Risk': float(probabilities[2])
            }

            # Get top contributing features for this assessment
            top_contributors = self.get_top_contributors(features_dict)

            return {
                'stress_level': predicted_category,
                'confidence': confidence,
                'all_probabilities': all_probabilities,
                'top_contributors': top_contributors
            }
        except Exception as e:
            print(f"Error during prediction: {e}")
            raise

    def get_top_contributors(self, features_dict, top_n=5):
        """
        Get top contributing features for the given assessment

        Args:
            features_dict: Dictionary with feature values
            top_n: Number of top features to return

        Returns:
            List of top contributors with their values and importance
        """
        contributors = []

        for feature_name, importance in self.feature_importance.items():
            if feature_name in features_dict:
                value = features_dict[feature_name]
                contributors.append({
                    'feature': feature_name,
                    'value': value,
                    'importance': importance,
                    'impact_score': importance * value  # Weighted by actual value
                })

        # Sort by impact score
        contributors.sort(key=lambda x: x['impact_score'], reverse=True)

        return contributors[:top_n]

    def get_feature_importance_summary(self):
        """Get overall feature importance"""
        sorted_importance = sorted(
            self.feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )

        return [
            {'feature': name, 'importance': importance}
            for name, importance in sorted_importance
        ]

# Singleton instance
ml_service = None

def get_ml_service():
    """Get or create ML service instance"""
    global ml_service
    if ml_service is None:
        ml_service = MLService()
    return ml_service
