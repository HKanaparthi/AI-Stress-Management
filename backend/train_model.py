"""
Student Stress Monitor - Machine Learning Model Training
This script trains a Random Forest classifier to predict student stress levels
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score
import joblib
import json
import os

class StressPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = []
        self.feature_importance = {}

    def load_and_preprocess_data(self):
        """Load and preprocess both datasets"""
        print("Loading datasets...")

        # Load primary dataset (StressLevelDataset.csv)
        df1 = pd.read_csv('../data/StressLevelDataset.csv')

        # Load secondary dataset (Stress_Dataset.csv)
        df2 = pd.read_csv('../data/Stress_Dataset.csv')

        print(f"Dataset 1 shape: {df1.shape}")
        print(f"Dataset 2 shape: {df2.shape}")

        # Use the first dataset as primary (cleaner format)
        df = df1.copy()

        # Map stress levels to categories
        # 0 = Low Risk, 1 = Moderate Risk, 2 = High Risk
        df['stress_category'] = df['stress_level'].map({
            0: 'Low Risk',
            1: 'Moderate Risk',
            2: 'High Risk'
        })

        # Separate features and target
        X = df.drop(['stress_level', 'stress_category'], axis=1)
        y = df['stress_level']

        self.feature_names = X.columns.tolist()

        print(f"\nFeatures ({len(self.feature_names)}): {self.feature_names}")
        print(f"\nTarget distribution:\n{df['stress_category'].value_counts()}")

        return X, y, df

    def train(self, X, y):
        """Train the Random Forest model with hyperparameter tuning"""
        print("\nSplitting data into train and test sets...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # Scale features
        print("Scaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Hyperparameter tuning
        print("\nPerforming hyperparameter tuning...")
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 20, 30, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'max_features': ['sqrt', 'log2']
        }

        rf = RandomForestClassifier(random_state=42, class_weight='balanced')

        grid_search = GridSearchCV(
            rf, param_grid, cv=5, scoring='f1_weighted',
            n_jobs=-1, verbose=1
        )

        print("Training model...")
        grid_search.fit(X_train_scaled, y_train)

        self.model = grid_search.best_estimator_

        print(f"\nBest parameters: {grid_search.best_params_}")
        print(f"Best cross-validation score: {grid_search.best_score_:.4f}")

        # Evaluate on test set
        y_pred = self.model.predict(X_test_scaled)

        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')

        print(f"\n{'='*60}")
        print("MODEL PERFORMANCE")
        print(f"{'='*60}")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"F1 Score (weighted): {f1:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred,
                                    target_names=['Low Risk', 'Moderate Risk', 'High Risk']))

        print(f"\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

        # Feature importance
        self.calculate_feature_importance()

        return X_test_scaled, y_test, y_pred

    def calculate_feature_importance(self):
        """Calculate and store feature importance"""
        importances = self.model.feature_importances_

        # Create feature importance dictionary
        self.feature_importance = {
            name: float(importance)
            for name, importance in zip(self.feature_names, importances)
        }

        # Sort by importance
        sorted_importance = sorted(
            self.feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )

        print(f"\n{'='*60}")
        print("TOP 10 FEATURE IMPORTANCE")
        print(f"{'='*60}")
        for i, (feature, importance) in enumerate(sorted_importance[:10], 1):
            print(f"{i}. {feature}: {importance:.4f}")

    def predict_with_confidence(self, features):
        """Predict stress level with confidence scores"""
        # Scale features
        features_scaled = self.scaler.transform([features])

        # Get prediction
        prediction = self.model.predict(features_scaled)[0]

        # Get probability scores
        probabilities = self.model.predict_proba(features_scaled)[0]

        confidence_scores = {
            'Low Risk': float(probabilities[0]),
            'Moderate Risk': float(probabilities[1]),
            'High Risk': float(probabilities[2])
        }

        predicted_category = ['Low Risk', 'Moderate Risk', 'High Risk'][prediction]
        confidence = float(probabilities[prediction])

        return {
            'prediction': predicted_category,
            'confidence': confidence,
            'all_probabilities': confidence_scores
        }

    def save_model(self, filepath='models/stress_predictor.pkl'):
        """Save the trained model and associated data"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance
        }

        joblib.dump(model_data, filepath)
        print(f"\nModel saved to {filepath}")

        # Also save feature importance as JSON for easy access
        with open('models/feature_importance.json', 'w') as f:
            json.dump(self.feature_importance, f, indent=2)

        # Save feature names
        with open('models/feature_names.json', 'w') as f:
            json.dump(self.feature_names, f, indent=2)

    def load_model(self, filepath='models/stress_predictor.pkl'):
        """Load a trained model"""
        model_data = joblib.load(filepath)

        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.feature_importance = model_data['feature_importance']

        print(f"Model loaded from {filepath}")

def main():
    """Main training pipeline"""
    print("="*60)
    print("STUDENT STRESS MONITOR - MODEL TRAINING")
    print("="*60)

    # Initialize predictor
    predictor = StressPredictor()

    # Load and preprocess data
    X, y, df = predictor.load_and_preprocess_data()

    # Train model
    X_test, y_test, y_pred = predictor.train(X, y)

    # Save model
    predictor.save_model()

    print(f"\n{'='*60}")
    print("Training completed successfully!")
    print(f"{'='*60}")

    # Test prediction
    print("\n\nTesting prediction on sample data...")
    sample_features = X.iloc[0].values
    result = predictor.predict_with_confidence(sample_features)
    print(f"Sample prediction: {result}")

if __name__ == "__main__":
    main()
