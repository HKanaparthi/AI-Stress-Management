import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assessmentAPI } from '@/services/api';
import type { Assessment } from '@/types';
import { Brain, ArrowLeft, TrendingUp, AlertCircle, CheckCircle, Calendar, Target } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [id]);

  const loadAssessment = async () => {
    try {
      if (!id) return;
      const response = await assessmentAPI.getById(parseInt(id));
      setAssessment(response.assessment);
    } catch (error: any) {
      toast.error('Failed to load assessment results');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'Low Risk':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800 border-green-300',
        };
      case 'Moderate Risk':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        };
      case 'High Risk':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800 border-gray-300',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Found</h2>
          <Link to="/dashboard" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const colors = getStressColor(assessment.stress_level);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(assessment.created_at)}</span>
          </div>
        </div>

        {/* Stress Level Card */}
        <div className={`card mb-8 border-2 ${colors.border} ${colors.bg}`}>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 mb-2">Your Stress Level</p>
            <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold border-2 mb-4 ${colors.badge}`}>
              {assessment.stress_level}
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Confidence Score</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 max-w-md bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all"
                    style={{ width: `${assessment.confidence_score * 100}%` }}
                  ></div>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {(assessment.confidence_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className={`text-sm ${colors.text} max-w-2xl mx-auto`}>
              {assessment.stress_level === 'Low Risk' &&
                'Your stress levels appear well-managed. Continue with your current healthy practices and stay mindful of your mental wellbeing.'}
              {assessment.stress_level === 'Moderate Risk' &&
                'You are experiencing moderate stress levels. Consider implementing the recommendations below to improve your wellbeing.'}
              {assessment.stress_level === 'High Risk' &&
                'Your assessment indicates high stress levels. We strongly recommend reaching out to campus counseling services and following the recommendations below.'}
            </p>
          </div>
        </div>

        {/* Probability Distribution */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-primary-600" />
            Detailed Analysis
          </h2>
          <div className="space-y-3">
            {Object.entries(assessment.all_probabilities).map(([level, probability]) => (
              <div key={level}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{level}</span>
                  <span className="text-gray-600">{(probability * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      level === 'Low Risk' ? 'bg-green-500' :
                      level === 'Moderate Risk' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${probability * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Top Stress Contributors
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            These factors have the highest impact on your stress level based on the assessment:
          </p>
          <div className="space-y-3">
            {assessment.top_contributors.slice(0, 5).map((contributor, index) => (
              <div key={contributor.feature} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-900 capitalize">
                      {contributor.feature.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    Value: {contributor.value}
                  </span>
                </div>
                <div className="ml-8">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${contributor.importance * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Impact: {(contributor.importance * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary-600" />
            Personalized Recommendations
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Based on your assessment, here are tailored strategies to help manage your stress:
          </p>
          <div className="space-y-2">
            {assessment.recommendations.map((recommendation, index) => (
              <div key={index} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Resources */}
        {assessment.stress_level === 'High Risk' && (
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-8">
            <h3 className="font-bold text-red-900 mb-3 text-lg">Immediate Support Available</h3>
            <p className="text-red-800 mb-4">
              If you're experiencing a mental health crisis, please reach out immediately:
            </p>
            <ul className="text-red-800 space-y-2">
              <li className="flex items-center gap-2">
                <span className="font-semibold">National Suicide Prevention Lifeline:</span> 988
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Crisis Text Line:</span> Text HOME to 741741
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold">Campus Counseling:</span> Contact your student health center
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <Link to="/assessment" className="btn-primary flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Take Another Assessment
          </Link>
          <Link to="/history" className="btn-secondary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            View History & Trends
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
