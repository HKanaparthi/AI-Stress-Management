"""
Student Stress Monitor - Improved Machine Learning Model Training
This script compares multiple models and uses advanced techniques for better prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score, roc_auc_score
from sklearn.feature_selection import SelectKBest, f_classif, RFE
import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore')


class ImprovedStressPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.feature_importance = {}
        self.best_model_name = ""

    def load_and_preprocess_data(self):
        """Load and preprocess the dataset with enhanced feature engineering"""
        print("=" * 70)
        print("LOADING AND PREPROCESSING DATA")
        print("=" * 70)

        # Load primary dataset
        df = pd.read_csv('../data/StressLevelDataset.csv')
        print(f"Dataset shape: {df.shape}")
        print(f"\nTarget distribution:")
        print(df['stress_level'].value_counts())

        # Separate features and target
        X = df.drop(['stress_level'], axis=1)
        y = df['stress_level']

        self.feature_names = X.columns.tolist()

        # Feature engineering: Add interaction features
        print("\nCreating interaction features...")
        X['mental_composite'] = X['anxiety_level'] + X['depression'] + (1 - X['self_esteem']/30) * 30
        X['physical_health'] = X['headache'] + X['blood_pressure'] + X['breathing_problem']
        X['academic_stress'] = X['study_load'] + (5 - X['academic_performance']) + X['future_career_concerns']
        X['social_wellbeing'] = X['social_support'] + (5 - X['peer_pressure']) + (5 - X['bullying'])
        X['environment_quality'] = X['living_conditions'] + X['safety'] + X['basic_needs'] - X['noise_level']

        # Update feature names
        self.feature_names = X.columns.tolist()
        print(f"Total features after engineering: {len(self.feature_names)}")

        return X, y, df

    def compare_models(self, X_train, X_test, y_train, y_test):
        """Compare multiple models and select the best one"""
        print("\n" + "=" * 70)
        print("COMPARING MULTIPLE MODELS")
        print("=" * 70)

        models = {
            'Random Forest': RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            ),
            'Gradient Boosting': GradientBoostingClassifier(
                n_estimators=150,
                max_depth=5,
                learning_rate=0.1,
                random_state=42
            ),
            'SVM': SVC(
                kernel='rbf',
                C=10,
                gamma='scale',
                probability=True,
                class_weight='balanced',
                random_state=42
            ),
            'Logistic Regression': LogisticRegression(
                max_iter=1000,
                class_weight='balanced',
                random_state=42,
                multi_class='multinomial'
            ),
            'AdaBoost': AdaBoostClassifier(
                n_estimators=100,
                learning_rate=0.5,
                random_state=42
            )
        }

        results = {}
        best_f1 = 0
        best_model = None
        best_model_name = ""

        for name, model in models.items():
            print(f"\nTraining {name}...")

            # Train model
            model.fit(X_train, y_train)

            # Predict
            y_pred = model.predict(X_test)

            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred, average='weighted')

            # Cross-validation score
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1_weighted')

            results[name] = {
                'accuracy': accuracy,
                'f1_score': f1,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }

            print(f"  Accuracy: {accuracy:.4f}")
            print(f"  F1 Score: {f1:.4f}")
            print(f"  CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

            if f1 > best_f1:
                best_f1 = f1
                best_model = model
                best_model_name = name

        # Print comparison summary
        print("\n" + "=" * 70)
        print("MODEL COMPARISON SUMMARY")
        print("=" * 70)
        print(f"{'Model':<25} {'Accuracy':<12} {'F1 Score':<12} {'CV Score':<15}")
        print("-" * 65)
        for name, metrics in results.items():
            marker = " ***" if name == best_model_name else ""
            print(f"{name:<25} {metrics['accuracy']:.4f}       {metrics['f1_score']:.4f}       {metrics['cv_mean']:.4f} +/- {metrics['cv_std']:.4f}{marker}")

        print(f"\nBest Model: {best_model_name} (F1 Score: {best_f1:.4f})")

        return best_model, best_model_name, results

    def create_ensemble(self, X_train, y_train):
        """Create an ensemble of top models"""
        print("\n" + "=" * 70)
        print("CREATING ENSEMBLE MODEL")
        print("=" * 70)

        # Create ensemble with voting
        ensemble = VotingClassifier(
            estimators=[
                ('rf', RandomForestClassifier(
                    n_estimators=200, max_depth=20, min_samples_split=5,
                    class_weight='balanced', random_state=42, n_jobs=-1
                )),
                ('gb', GradientBoostingClassifier(
                    n_estimators=150, max_depth=5, learning_rate=0.1, random_state=42
                )),
                ('svm', SVC(
                    kernel='rbf', C=10, probability=True,
                    class_weight='balanced', random_state=42
                ))
            ],
            voting='soft'
        )

        print("Training ensemble model...")
        ensemble.fit(X_train, y_train)

        return ensemble

    def train(self, X, y):
        """Main training pipeline"""
        print("\n" + "=" * 70)
        print("STARTING TRAINING PIPELINE")
        print("=" * 70)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        print(f"Training set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")

        # Scale features
        print("\nScaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Compare individual models
        best_single, best_name, results = self.compare_models(
            X_train_scaled, X_test_scaled, y_train, y_test
        )

        # Create and evaluate ensemble
        ensemble = self.create_ensemble(X_train_scaled, y_train)
        y_pred_ensemble = ensemble.predict(X_test_scaled)
        ensemble_f1 = f1_score(y_test, y_pred_ensemble, average='weighted')
        ensemble_acc = accuracy_score(y_test, y_pred_ensemble)

        print(f"\nEnsemble Performance:")
        print(f"  Accuracy: {ensemble_acc:.4f}")
        print(f"  F1 Score: {ensemble_f1:.4f}")

        # Choose the best model
        if ensemble_f1 > results[best_name]['f1_score']:
            self.model = ensemble
            self.best_model_name = "Ensemble (RF + GB + SVM)"
            final_f1 = ensemble_f1
            final_acc = ensemble_acc
            y_pred = y_pred_ensemble
            print(f"\n>>> Selected: Ensemble Model (F1: {ensemble_f1:.4f})")
        else:
            self.model = best_single
            self.best_model_name = best_name
            final_f1 = results[best_name]['f1_score']
            final_acc = results[best_name]['accuracy']
            y_pred = best_single.predict(X_test_scaled)
            print(f"\n>>> Selected: {best_name} (F1: {final_f1:.4f})")

        # Final evaluation
        print("\n" + "=" * 70)
        print("FINAL MODEL PERFORMANCE")
        print("=" * 70)
        print(f"Model: {self.best_model_name}")
        print(f"Accuracy: {final_acc:.4f}")
        print(f"F1 Score: {final_f1:.4f}")
        print(f"\nClassification Report:")
        print(classification_report(y_test, y_pred,
                                    target_names=['Low Risk', 'Moderate Risk', 'High Risk']))
        print(f"\nConfusion Matrix:")
        print(confusion_matrix(y_test, y_pred))

        # Calculate feature importance
        self.calculate_feature_importance(X_train_scaled, y_train)

        return X_test_scaled, y_test, y_pred, final_f1

    def calculate_feature_importance(self, X_train, y_train):
        """Calculate feature importance using multiple methods"""
        print("\n" + "=" * 70)
        print("FEATURE IMPORTANCE ANALYSIS")
        print("=" * 70)

        # Method 1: Random Forest importance (if available)
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        elif hasattr(self.model, 'estimators_'):
            # For ensemble, use the RF component
            for name, estimator in self.model.named_estimators_.items():
                if hasattr(estimator, 'feature_importances_'):
                    importances = estimator.feature_importances_
                    break
        else:
            # Use permutation importance or SelectKBest
            selector = SelectKBest(f_classif, k='all')
            selector.fit(X_train, y_train)
            importances = selector.scores_ / selector.scores_.sum()

        # Create feature importance dictionary
        self.feature_importance = {
            name: float(importance)
            for name, importance in zip(self.feature_names, importances)
        }

        # Sort and display
        sorted_importance = sorted(
            self.feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )

        print("Top 15 Most Important Features:")
        print("-" * 50)
        for i, (feature, importance) in enumerate(sorted_importance[:15], 1):
            bar = '*' * int(importance * 100)
            print(f"{i:2}. {feature:<30} {importance:.4f} {bar}")

    def predict_with_confidence(self, features_dict):
        """Predict with confidence scores"""
        # Convert to array
        features = [features_dict.get(name, 0) for name in self.feature_names]
        features_scaled = self.scaler.transform([features])

        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]

        stress_categories = ['Low Risk', 'Moderate Risk', 'High Risk']

        return {
            'prediction': stress_categories[prediction],
            'confidence': float(probabilities[prediction]),
            'all_probabilities': {
                cat: float(prob) for cat, prob in zip(stress_categories, probabilities)
            }
        }

    def save_model(self, filepath='models/stress_predictor.pkl'):
        """Save the trained model"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'feature_importance': self.feature_importance,
            'model_name': self.best_model_name
        }

        joblib.dump(model_data, filepath)
        print(f"\nModel saved to {filepath}")

        # Save feature importance as JSON
        with open('models/feature_importance.json', 'w') as f:
            json.dump(self.feature_importance, f, indent=2)

        # Save feature names
        with open('models/feature_names.json', 'w') as f:
            json.dump(self.feature_names, f, indent=2)

        # Save model metadata
        metadata = {
            'model_name': self.best_model_name,
            'num_features': len(self.feature_names),
            'feature_names': self.feature_names
        }
        with open('models/model_metadata.json', 'w') as f:
            json.dump(metadata, f, indent=2)


def main():
    """Main training pipeline"""
    print("=" * 70)
    print("STUDENT STRESS MONITOR - IMPROVED MODEL TRAINING")
    print("=" * 70)

    predictor = ImprovedStressPredictor()

    # Load and preprocess
    X, y, df = predictor.load_and_preprocess_data()

    # Train
    X_test, y_test, y_pred, final_f1 = predictor.train(X, y)

    # Save
    predictor.save_model()

    print("\n" + "=" * 70)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print(f"Final Model: {predictor.best_model_name}")
    print(f"Final F1 Score: {final_f1:.4f}")

    # Test prediction
    print("\n\nTesting prediction on sample data...")
    sample = {
        'anxiety_level': 15,
        'self_esteem': 20,
        'mental_health_history': 0,
        'depression': 10,
        'headache': 2,
        'blood_pressure': 1,
        'sleep_quality': 3,
        'breathing_problem': 1,
        'noise_level': 2,
        'living_conditions': 4,
        'safety': 4,
        'basic_needs': 4,
        'academic_performance': 3,
        'study_load': 3,
        'teacher_student_relationship': 4,
        'future_career_concerns': 3,
        'social_support': 3,
        'peer_pressure': 2,
        'extracurricular_activities': 3,
        'bullying': 1,
        # Engineered features
        'mental_composite': 15 + 10 + (1 - 20/30) * 30,
        'physical_health': 2 + 1 + 1,
        'academic_stress': 3 + (5 - 3) + 3,
        'social_wellbeing': 3 + (5 - 2) + (5 - 1),
        'environment_quality': 4 + 4 + 4 - 2
    }
    result = predictor.predict_with_confidence(sample)
    print(f"Sample prediction: {result}")


if __name__ == "__main__":
    main()
