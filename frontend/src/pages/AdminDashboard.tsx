import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { adminAPI } from '@/services/api';
import {
  Brain,
  Users,
  FileText,
  AlertTriangle,
  Download,
  LogOut,
  User,
  ChevronRight,
  ChevronLeft,
  Shield,
  Activity,
  Calendar,
  Mail,
  RefreshCw
} from 'lucide-react';
import type { DashboardStats, User as UserType } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface AdminUser extends UserType {
  assessment_count: number;
  latest_stress_level: string | null;
  latest_assessment_date?: string | null;
}

interface HighRiskAlert {
  assessment_id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  stress_level: string;
  confidence: number;
  date: string;
  top_contributors: Array<{ feature: string; value: number }>;
}

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [alerts, setAlerts] = useState<HighRiskAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'alerts'>('overview');
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user has admin/counselor access
    if (user && !['admin', 'counselor'].includes(user.role)) {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [usersPage, activeTab]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, alertsData] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getHighRiskAlerts()
      ]);
      setStats(dashboardStats);
      setAlerts(alertsData.alerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers(usersPage, 10);
      setUsers(response.users);
      setUsersTotalPages(response.pages);
      setUsersTotal(response.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    if (activeTab === 'users') {
      await loadUsers();
    }
    setRefreshing(false);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await adminAPI.exportData();

      // Create CSV content
      if (response.data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(response.data[0]);
      const csvContent = [
        headers.join(','),
        ...response.data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Handle values that might contain commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stress_assessment_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
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

  const formatFeatureName = (feature: string) => {
    return feature
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Chart data
  const pieChartData = stats ? [
    { name: 'Low Risk', value: stats.stress_distribution.low_risk, color: '#22c55e' },
    { name: 'Moderate Risk', value: stats.stress_distribution.moderate_risk, color: '#eab308' },
    { name: 'High Risk', value: stats.stress_distribution.high_risk, color: '#ef4444' }
  ] : [];

  const barChartData = stats?.trend_data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    assessments: item.count
  })) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor system health, manage users, and track high-risk alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Users ({stats?.total_users || 0})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            High-Risk Alerts
            {alerts.length > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {alerts.length}
              </span>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Assessments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_assessments}</p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Last 30 Days</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.recent_assessments}</p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">High Risk Students</p>
                    <p className="text-3xl font-bold text-red-600">{stats.high_risk_students}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Stress Distribution Pie Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress Distribution</h3>
                {stats.total_assessments > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No assessment data available
                  </div>
                )}
              </div>

              {/* Weekly Trend Bar Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assessments (Last 7 Days)
                </h3>
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="assessments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No recent assessment data
                  </div>
                )}
              </div>
            </div>

            {/* Model Performance */}
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">Average Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(stats.average_confidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">Model Accuracy</p>
                  <p className="text-2xl font-bold text-green-600">89.1%</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm mb-1">F1 Score</p>
                  <p className="text-2xl font-bold text-blue-600">0.89</p>
                </div>
              </div>
            </div>

            {/* Quick Alerts Preview */}
            {alerts.length > 0 && (
              <div className="card border-2 border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Recent High-Risk Alerts
                  </h3>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {alerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.assessment_id}
                      className="p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{alert.user.name}</p>
                          <p className="text-sm text-gray-600">{alert.user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            {(alert.confidence * 100).toFixed(0)}% confidence
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(alert.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                All Users ({usersTotal})
              </h3>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No users found
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Assessments</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Latest Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={`/avatars/${u.profile_picture}`}
                                alt={`${u.first_name}'s avatar`}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/avatars/photo1.jpg';
                                }}
                              />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {u.first_name} {u.last_name}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'counselor'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{u.assessment_count}</span>
                          </td>
                          <td className="py-3 px-4">
                            {u.latest_stress_level ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStressColor(u.latest_stress_level)}`}>
                                {u.latest_stress_level}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">No assessments</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(u.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => navigate(`/admin/users/${u.id}`)}
                              className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                            >
                              View <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(usersPage - 1) * 10 + 1} to {Math.min(usersPage * 10, usersTotal)} of {usersTotal} users
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                        disabled={usersPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 text-sm">
                        Page {usersPage} of {usersTotalPages}
                      </span>
                      <button
                        onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                        disabled={usersPage === usersTotalPages}
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
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                High-Risk Alerts (Last 7 Days)
              </h3>
              <span className="text-sm text-gray-500">
                {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No High-Risk Alerts</h4>
                <p className="text-gray-600">
                  There are no high-risk assessments in the last 7 days.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.assessment_id}
                    className="p-4 bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{alert.user.name}</p>
                          <p className="text-sm text-gray-600">{alert.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-red-600 text-white text-sm font-semibold rounded-full">
                          High Risk
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {(alert.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Top Contributing Factors:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.top_contributors.map((contributor, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white border border-red-200 text-red-800 text-xs rounded-full"
                          >
                            {formatFeatureName(contributor.feature)}: {contributor.value}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-red-200">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(alert.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${alert.user.email}?subject=Mental Health Check-in&body=Hi ${alert.user.name.split(' ')[0]},%0D%0A%0D%0AWe noticed from your recent stress assessment that you might be going through a challenging time. We wanted to reach out and let you know that support is available.%0D%0A%0D%0AWould you like to schedule a time to talk with a counselor?%0D%0A%0D%0ABest regards,%0D%0ACampus Counseling Services`}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 flex items-center gap-1"
                        >
                          <Mail className="w-4 h-4" />
                          Contact Student
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Crisis Resources */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Counselor Resources</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li><strong>Crisis Intervention Protocol:</strong> Follow campus guidelines for high-risk student outreach</li>
                <li><strong>National Suicide Prevention Lifeline:</strong> 988 (share with students as needed)</li>
                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
              </ul>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
