export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'counselor' | 'admin';
  profile_picture: string;
  created_at: string;
  last_login: string | null;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
}

export interface AssessmentData {
  anxiety_level: number;
  self_esteem: number;
  mental_health_history: number;
  depression: number;
  headache: number;
  blood_pressure: number;
  sleep_quality: number;
  breathing_problem: number;
  noise_level: number;
  living_conditions: number;
  safety: number;
  basic_needs: number;
  academic_performance: number;
  study_load: number;
  teacher_student_relationship: number;
  future_career_concerns: number;
  social_support: number;
  peer_pressure: number;
  extracurricular_activities: number;
  bullying: number;
}

export interface TopContributor {
  feature: string;
  value: number;
  importance: number;
  impact_score: number;
}

export interface Assessment {
  id: number;
  user_id: number;
  assessment_data: AssessmentData;
  stress_level: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  confidence_score: number;
  all_probabilities: {
    'Low Risk': number;
    'Moderate Risk': number;
    'High Risk': number;
  };
  top_contributors: TopContributor[];
  recommendations: string[];
  created_at: string;
  notes: string | null;
}

export interface TrendData {
  date: string;
  stress_level: string;
  confidence: number;
  probabilities: {
    'Low Risk': number;
    'Moderate Risk': number;
    'High Risk': number;
  };
}

export interface Statistics {
  total_assessments: number;
  low_risk_percentage: number;
  moderate_risk_percentage: number;
  high_risk_percentage: number;
  latest_stress_level: string | null;
}

export interface DashboardStats {
  total_users: number;
  total_assessments: number;
  recent_assessments: number;
  high_risk_students: number;
  stress_distribution: {
    low_risk: number;
    moderate_risk: number;
    high_risk: number;
  };
  trend_data: Array<{
    date: string;
    count: number;
  }>;
  average_confidence: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}
