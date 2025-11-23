import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { adminAPI } from '@/services/api';
import {
  Brain,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calendar,
  Mail,
  Activity,
  FileText,
  AlertTriangle
} from 'lucide-react';
import type { User as UserType, Assessment } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [targetUser, setTargetUser] = useState<UserType | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (currentUser && !['admin', 'counselor'].includes(currentUser.role)) {
      navigate('/dashboard');
      return;
    }
    if (id) {
      loadUserData();
    }
  }, [id, currentUser, navigate]);

  useEffect(() => {
    if (id && targetUser) {
      loadAssessments();
    }
  }, [page, id, targetUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUserAssessments(parseInt(id!), 1, 10);
      setTargetUser(response.user);
      setAssessments(response.assessments);
      setTotalPages(response.pages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load user data:', error);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const loadAssessments = async () => {
    try {
      const response = await adminAPI.getUserAssessments(parseInt(id!), page, 10);
      setAssessments(response.assessments);
      setTotalPages(response.pages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load assessments:', error);
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

  const getStressValue = (level: string) => {
    switch (level) {
      case 'Low Risk':
        return 1;
      case 'Moderate Risk':
        return 2;
      case 'High Risk':
        return 3;
      default:
        return 0;
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

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Prepare chart data (reverse to show oldest first)
  const chartData = [...assessments].reverse().map((assessment) => ({
    date: formatShortDate(assessment.created_at),
    stressLevel: getStressValue(assessment.stress_level),
    confidence: Math.round(assessment.confidence_score * 100),
    label: assessment.stress_level
  }));

  // Calculate statistics
  const stats = {
    total: total,
    highRisk: assessments.filter(a => a.stress_level === 'High Risk').length,
    moderateRisk: assessments.filter(a => a.stress_level === 'Moderate Risk').length,
    lowRisk: assessments.filter(a => a.stress_level === 'Low Risk').length,
    avgConfidence: assessments.length > 0
      ? assessments.reduce((sum, a) => sum + a.confidence_score, 0) / assessments.length
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <Link to="/admin" className="text-purple-600 hover:text-purple-700">
            Back to Admin Dashboard
          </Link>
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
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                Admin
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/admin" className="text-purple-600 font-medium">
                Admin
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
        {/* Back Link */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Admin Dashboard
        </Link>

        {/* User Profile Card */}
        <div className="card mb-8">
          <div className="flex items-start gap-6">
            <img
              src={`/avatars/${targetUser.profile_picture}`}
              alt={`${targetUser.first_name}'s avatar`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/photo1.jpg';
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {targetUser.first_name} {targetUser.last_name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  targetUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : targetUser.role === 'counselor'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {targetUser.role.charAt(0).toUpperCase() + targetUser.role.slice(1)}
                </span>
              </div>
              <div className="space-y-1 text-gray-600">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {targetUser.email}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(targetUser.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {targetUser.last_login && (
                  <p className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Last login: {formatDate(targetUser.last_login)}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <a
                href={`mailto:${targetUser.email}?subject=Mental Health Check-in&body=Hi ${targetUser.first_name},%0D%0A%0D%0A`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Mail className="w-4 h-4" />
                Contact Student
              </a>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="card text-center">
            <div className="p-2 bg-blue-100 rounded-lg w-fit mx-auto mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Assessments</p>
          </div>
          <div className="card text-center border-2 border-green-200 bg-green-50">
            <div className="p-2 bg-green-100 rounded-lg w-fit mx-auto mb-2">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.lowRisk}</p>
            <p className="text-sm text-gray-600">Low Risk</p>
          </div>
          <div className="card text-center border-2 border-yellow-200 bg-yellow-50">
            <div className="p-2 bg-yellow-100 rounded-lg w-fit mx-auto mb-2">
              <Activity className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats.moderateRisk}</p>
            <p className="text-sm text-gray-600">Moderate Risk</p>
          </div>
          <div className="card text-center border-2 border-red-200 bg-red-50">
            <div className="p-2 bg-red-100 rounded-lg w-fit mx-auto mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.highRisk}</p>
            <p className="text-sm text-gray-600">High Risk</p>
          </div>
          <div className="card text-center">
            <div className="p-2 bg-purple-100 rounded-lg w-fit mx-auto mb-2">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{(stats.avgConfidence * 100).toFixed(0)}%</p>
            <p className="text-sm text-gray-600">Avg Confidence</p>
          </div>
        </div>

        {/* Stress Level Trend Chart */}
        {assessments.length > 1 && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stress Level Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={[0, 4]}
                  ticks={[1, 2, 3]}
                  tickFormatter={(value) => {
                    switch (value) {
                      case 1: return 'Low';
                      case 2: return 'Moderate';
                      case 3: return 'High';
                      default: return '';
                    }
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'stressLevel') {
                      switch (value) {
                        case 1: return ['Low Risk', 'Stress Level'];
                        case 2: return ['Moderate Risk', 'Stress Level'];
                        case 3: return ['High Risk', 'Stress Level'];
                        default: return [value, name];
                      }
                    }
                    return [`${value}%`, 'Confidence'];
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="stressLevel"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  name="Stress Level"
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Confidence %"
                  yAxisId={0}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Low Risk (1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Moderate Risk (2)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">High Risk (3)</span>
              </div>
            </div>
          </div>
        )}

        {/* Assessment History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Assessment History</h2>
            <span className="text-sm text-gray-500">{total} assessments</span>
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments</h3>
              <p className="text-gray-600">This user hasn't taken any assessments yet.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStressColor(assessment.stress_level)}`}>
                            {assessment.stress_level}
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: {(assessment.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(assessment.created_at)}
                        </p>

                        {/* Top Contributors */}
                        {assessment.top_contributors && assessment.top_contributors.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Top Contributing Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {assessment.top_contributors.slice(0, 3).map((contributor, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded"
                                >
                                  {contributor.feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/results/${assessment.id}`}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} assessments
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${targetUser.email}?subject=Stress Assessment Follow-up&body=Hi ${targetUser.first_name},%0D%0A%0D%0AI wanted to follow up regarding your recent stress assessment. Would you be available for a brief check-in?%0D%0A%0D%0ABest regards`}
              className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
            >
              Send Follow-up Email
            </a>
            <a
              href={`mailto:${targetUser.email}?subject=Campus Resources&body=Hi ${targetUser.first_name},%0D%0A%0D%0AI wanted to share some resources that might be helpful:%0D%0A%0D%0A- Campus Counseling Center: [contact info]%0D%0A- Student Health Services: [contact info]%0D%0A- 24/7 Crisis Line: 988%0D%0A%0D%0AFeel free to reach out if you need any support.%0D%0A%0D%0ABest regards`}
              className="px-4 py-2 bg-white border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
            >
              Share Resources
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
