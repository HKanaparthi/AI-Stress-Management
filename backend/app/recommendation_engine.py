"""
Rule-based Recommendation Engine for Student Stress Management
"""

class RecommendationEngine:
    """Generates personalized recommendations based on stress factors"""

    def __init__(self):
        self.recommendations_db = self._load_recommendations()

    def _load_recommendations(self):
        """Load recommendation rules"""
        return {
            'anxiety_level': {
                'high': [
                    "Practice deep breathing exercises (4-7-8 technique) for 5-10 minutes daily",
                    "Consider mindfulness meditation using apps like Headspace or Calm",
                    "Engage in regular physical exercise (30 minutes, 3-4 times per week)",
                    "Limit caffeine intake, especially in the afternoon and evening",
                    "Speak with a campus counselor about anxiety management strategies"
                ],
                'moderate': [
                    "Try progressive muscle relaxation techniques",
                    "Take short breaks during study sessions (Pomodoro technique)",
                    "Practice journaling to identify anxiety triggers"
                ]
            },
            'self_esteem': {
                'low': [
                    "Set small, achievable daily goals to build confidence",
                    "Practice positive self-talk and challenge negative thoughts",
                    "Join student clubs or activities aligned with your interests",
                    "Consider talking to a counselor about cognitive behavioral techniques",
                    "Celebrate your achievements, no matter how small"
                ]
            },
            'sleep_quality': {
                'poor': [
                    "Establish a consistent sleep schedule (same bedtime and wake time)",
                    "Create a relaxing bedtime routine (no screens 1 hour before bed)",
                    "Avoid caffeine after 2 PM",
                    "Keep your room cool, dark, and quiet",
                    "Limit naps to 20-30 minutes before 3 PM",
                    "Consider sleep hygiene counseling at the health center"
                ]
            },
            'academic_performance': {
                'struggling': [
                    "Visit your professor during office hours for clarification",
                    "Form or join study groups with classmates",
                    "Utilize campus tutoring services and academic support centers",
                    "Break large assignments into smaller, manageable tasks",
                    "Create a study schedule and stick to it",
                    "Consider meeting with an academic advisor"
                ]
            },
            'study_load': {
                'overwhelming': [
                    "Use time management tools (calendar, planner, apps)",
                    "Prioritize tasks using the Eisenhower Matrix (urgent/important)",
                    "Learn to say 'no' to non-essential commitments",
                    "Break study sessions into focused 25-minute intervals",
                    "Delegate or ask for help when needed",
                    "Evaluate course load with academic advisor for future semesters"
                ]
            },
            'social_support': {
                'lacking': [
                    "Join campus clubs, organizations, or sports teams",
                    "Attend campus events and social activities",
                    "Connect with classmates through study groups",
                    "Consider peer mentoring programs",
                    "Reach out to family and friends regularly",
                    "Utilize campus counseling for social skills support"
                ]
            },
            'depression': {
                'high': [
                    "IMPORTANT: Reach out to campus counseling services immediately",
                    "Contact the National Suicide Prevention Lifeline: 988",
                    "Talk to a trusted friend, family member, or mentor",
                    "Maintain a daily routine including regular meals and sleep",
                    "Engage in activities you previously enjoyed",
                    "Consider professional mental health treatment"
                ]
            },
            'future_career_concerns': {
                'high': [
                    "Visit the career services center for guidance",
                    "Attend career fairs and networking events",
                    "Seek internships or volunteer opportunities in your field",
                    "Connect with alumni working in your area of interest",
                    "Develop a 5-year career plan with flexible goals",
                    "Consider informational interviews with professionals"
                ]
            },
            'peer_pressure': {
                'high': [
                    "Practice assertiveness skills and saying 'no'",
                    "Surround yourself with positive, supportive friends",
                    "Identify and avoid situations that increase pressure",
                    "Build confidence in your personal values and decisions",
                    "Seek counseling if peer pressure is affecting well-being"
                ]
            },
            'bullying': {
                'experiencing': [
                    "IMPORTANT: Report bullying to campus authorities immediately",
                    "Document incidents (dates, times, witnesses)",
                    "Speak with a counselor or trusted adult",
                    "Contact campus security if you feel unsafe",
                    "Know that bullying is never your fault",
                    "Consider joining support groups for bullying victims"
                ]
            }
        }

    def generate_recommendations(self, assessment_data, stress_level, top_contributors):
        """
        Generate personalized recommendations

        Args:
            assessment_data: Dictionary of assessment features
            stress_level: Predicted stress level
            top_contributors: List of top stress contributors

        Returns:
            List of personalized recommendations
        """
        recommendations = []

        # Add general recommendations based on stress level
        if stress_level == 'High Risk':
            recommendations.extend([
                "PRIORITY: Consider scheduling an appointment with campus counseling services",
                "Reach out to your academic advisor to discuss stress management strategies",
                "Take immediate steps to reduce overwhelming commitments"
            ])
        elif stress_level == 'Moderate Risk':
            recommendations.append(
                "Monitor your stress levels and consider preventive strategies"
            )

        # Get feature-specific recommendations based on top contributors
        for contributor in top_contributors[:5]:  # Focus on top 5
            feature_name = contributor['feature']
            value = contributor['value']

            # Analyze specific features
            if 'anxiety' in feature_name.lower() and value >= 15:
                recommendations.extend(
                    self.recommendations_db['anxiety_level']['high'][:3]
                )
            elif 'anxiety' in feature_name.lower() and value >= 10:
                recommendations.extend(
                    self.recommendations_db['anxiety_level']['moderate'][:2]
                )

            if 'self_esteem' in feature_name.lower() and value <= 10:
                recommendations.extend(
                    self.recommendations_db['self_esteem']['low'][:3]
                )

            if 'sleep' in feature_name.lower() and value <= 2:
                recommendations.extend(
                    self.recommendations_db['sleep_quality']['poor'][:3]
                )

            if 'academic_performance' in feature_name.lower() and value <= 2:
                recommendations.extend(
                    self.recommendations_db['academic_performance']['struggling'][:3]
                )

            if 'study_load' in feature_name.lower() and value >= 4:
                recommendations.extend(
                    self.recommendations_db['study_load']['overwhelming'][:3]
                )

            if 'social_support' in feature_name.lower() and value <= 2:
                recommendations.extend(
                    self.recommendations_db['social_support']['lacking'][:2]
                )

            if 'depression' in feature_name.lower() and value >= 20:
                recommendations.extend(
                    self.recommendations_db['depression']['high']
                )

            if 'future_career' in feature_name.lower() and value >= 4:
                recommendations.extend(
                    self.recommendations_db['future_career_concerns']['high'][:3]
                )

            if 'peer_pressure' in feature_name.lower() and value >= 4:
                recommendations.extend(
                    self.recommendations_db['peer_pressure']['high'][:2]
                )

            if 'bullying' in feature_name.lower() and value >= 4:
                recommendations.extend(
                    self.recommendations_db['bullying']['experiencing']
                )

        # Add general wellness recommendations
        recommendations.extend([
            "Maintain a balanced diet with regular meals",
            "Stay hydrated throughout the day",
            "Schedule regular breaks and leisure time",
            "Connect with friends and family regularly"
        ])

        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec not in seen:
                seen.add(rec)
                unique_recommendations.append(rec)

        return unique_recommendations[:15]  # Return top 15 recommendations

# Singleton instance
recommendation_engine = RecommendationEngine()

def get_recommendations(assessment_data, stress_level, top_contributors):
    """Get recommendations for an assessment"""
    return recommendation_engine.generate_recommendations(
        assessment_data,
        stress_level,
        top_contributors
    )
