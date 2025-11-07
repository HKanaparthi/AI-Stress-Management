import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { assessmentAPI } from '@/services/api';
import { Brain, ArrowLeft, TrendingUp, Calendar, AlertCircle, ChevronRight, LogOut, User } from 'lucide-react';
import type { Assessment, TrendData, Statistics } from '@/types';

export default function HistoryPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadData();
  }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyResponse, trendsResponse] = await Promise.all([
        assessmentAPI.getHistory(page, 10),
        assessmentAPI.getTrends(180)
      ]);

      setAssessments(historyResponse.assessments);
      setTotalPages(historyResponse.pages);
      setTrends(trendsResponse.trends);
      setStatistics(trendsResponse.statistics);
    } catch (error) {
      console.error('Failed to load history:', error);
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

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
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
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/history" className="text-primary-600 font-medium">
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
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment History</h1>
              <p className="text-gray-600">
                Track your stress levels over time and monitor your progress
              </p>
            </div>
            <Link to="/assessment" className="btn-primary flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Take Assessment
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && statistics.total_assessments > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.total_assessments}</p>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow border-2 border-green-200 bg-green-50">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Low Risk</p>
                <p className="text-3xl font-bold text-green-800">
                  {statistics.low_risk_percentage.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow border-2 border-yellow-200 bg-yellow-50">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Moderate Risk</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {statistics.moderate_risk_percentage.toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="card hover:shadow-lg transition-shadow border-2 border-red-200 bg-red-50">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">High Risk</p>
                <p className="text-3xl font-bold text-red-800">
                  {statistics.high_risk_percentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trend Visualization */}
        {trends.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Stress Level Trends (Last 6 Months)
            </h2>
            <div className="space-y-4">
              {trends.slice(0, 10).map((trend, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2">
                      <div
                        className="bg-green-500 h-6 rounded"
                        style={{ width: `${trend.probabilities['Low Risk'] * 100}%` }}
                        title={`Low Risk: ${(trend.probabilities['Low Risk'] * 100).toFixed(1)}%`}
                      ></div>
                      <div
                        className="bg-yellow-500 h-6 rounded"
                        style={{ width: `${trend.probabilities['Moderate Risk'] * 100}%` }}
                        title={`Moderate Risk: ${(trend.probabilities['Moderate Risk'] * 100).toFixed(1)}%`}
                      ></div>
                      <div
                        className="bg-red-500 h-6 rounded"
                        style={{ width: `${trend.probabilities['High Risk'] * 100}%` }}
                        title={`High Risk: ${(trend.probabilities['High Risk'] * 100).toFixed(1)}%`}
                      ></div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStressColor(trend.stress_level)}`}>
                      {trend.stress_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-600">Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">Moderate Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-600">High Risk</span>
              </div>
            </div>
          </div>
        )}

        {/* Assessment List */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            All Assessments
          </h2>

          {assessments.length === 0 ? (
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
            <>
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    to={`/results/${assessment.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStressColor(
                              assessment.stress_level
                            )}`}
                          >
                            {assessment.stress_level}
                          </span>
                          <span className="text-sm text-gray-600">
                            Confidence: {(assessment.confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(assessment.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary-600 group-hover:text-primary-700">
                        <span className="text-sm font-medium">View Details</span>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg ${
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
