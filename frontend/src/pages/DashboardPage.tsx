import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { assessmentAPI } from '@/services/api';
import { Brain, Activity, TrendingUp, FileText, LogOut, User, AlertCircle } from 'lucide-react';
import type { Assessment } from '@/types';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    latestStressLevel: null as string | null,
    latestDate: null as string | null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('=== Loading Dashboard Data ===');
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Token exists:', !!localStorage.getItem('token'));

      const history = await assessmentAPI.getHistory(1, 5);
      console.log('Received history:', history);
      console.log('Total assessments:', history.total);
      console.log('Assessments array length:', history.assessments?.length);
      console.log('Assessments array:', history.assessments);

      setRecentAssessments(history.assessments || []);
      setStats({
        total: history.total || 0,
        latestStressLevel: history.assessments?.[0]?.stress_level || null,
        latestDate: history.assessments?.[0]?.created_at || null,
      });
      console.log('Stats set to:', {
        total: history.total || 0,
        latestStressLevel: history.assessments?.[0]?.stress_level || null,
        latestDate: history.assessments?.[0]?.created_at || null,
      });
    } catch (error: any) {
      console.error('=== ERROR loading dashboard data ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStressColor = (level: string) => {
    switch (level) {
      case 'Low Risk':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate Risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High Risk':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Student Stress Monitor</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/dashboard" className="text-primary-600 font-medium">
                Dashboard
              </Link>
              <Link to="/history" className="text-gray-600 hover:text-gray-900">
                History
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600">
            Monitor your mental health and track your progress over time.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Latest Status</p>
                {stats.latestStressLevel ? (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStressColor(
                      stats.latestStressLevel
                    )}`}
                  >
                    {stats.latestStressLevel}
                  </span>
                ) : (
                  <p className="text-gray-400">No assessments yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/history')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">View Trends</p>
                <p className="text-lg font-semibold text-primary-600">
                  See Your Progress →
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/assessment"
            className="card hover:shadow-xl transition-all border-2 border-primary-600 bg-gradient-to-br from-primary-50 to-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Take New Assessment
                </h3>
                <p className="text-gray-600">
                  Complete a 20-question stress assessment and get personalized recommendations.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-primary-600 font-semibold">
                  Start Assessment
                  <span className="text-2xl">→</span>
                </div>
              </div>
              <Brain className="w-16 h-16 text-primary-600 opacity-20" />
            </div>
          </Link>

          <Link
            to="/history"
            className="card hover:shadow-xl transition-all border-2 border-transparent hover:border-gray-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  View History & Trends
                </h3>
                <p className="text-gray-600">
                  Track your stress levels over time with interactive charts.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-primary-600 font-semibold">
                  View History
                  <span className="text-2xl">→</span>
                </div>
              </div>
              <TrendingUp className="w-16 h-16 text-primary-600 opacity-20" />
            </div>
          </Link>
        </div>

        {/* Recent Assessments */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Assessments</h2>
            {recentAssessments.length > 0 && (
              <Link to="/history" className="text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </Link>
            )}
          </div>

          {recentAssessments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-600 mb-6">
                Take your first assessment to start tracking your mental health.
              </p>
              <Link to="/assessment" className="btn-primary inline-flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Take First Assessment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAssessments.map((assessment) => (
                <Link
                  key={assessment.id}
                  to={`/results/${assessment.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStressColor(
                            assessment.stress_level
                          )}`}
                        >
                          {assessment.stress_level}
                        </span>
                        <span className="text-sm text-gray-500">
                          Confidence: {(assessment.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(assessment.created_at)}
                      </p>
                    </div>
                    <div className="text-primary-600">
                      <span className="text-sm font-medium">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm mb-3">
            If you're experiencing a mental health crisis, please reach out immediately:
          </p>
          <ul className="text-blue-800 text-sm space-y-1">
            <li><strong>National Suicide Prevention Lifeline:</strong> 988</li>
            <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
            <li><strong>Campus Counseling:</strong> Contact your student health center</li>
          </ul>
        </div>

        {(user?.role === 'admin' || user?.role === 'counselor') && (
          <div className="mt-8">
            <Link
              to="/admin"
              className="card hover:shadow-lg transition-all border-2 border-purple-600 bg-gradient-to-br from-purple-50 to-white block"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Admin Dashboard
                  </h3>
                  <p className="text-gray-600">
                    Access system analytics and user management.
                  </p>
                </div>
                <span className="text-purple-600 text-2xl">→</span>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
