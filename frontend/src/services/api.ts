import axios from 'axios';
import type {
  AuthResponse,
  User,
  Assessment,
  AssessmentData,
  TrendData,
  Statistics,
  DashboardStats,
  FeatureImportance
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
  }): Promise<{ message: string; user: User }> => {
    const response = await api.put('/api/auth/update-profile', data);
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },
};

// Assessment API
export const assessmentAPI = {
  submit: async (
    assessmentData: AssessmentData
  ): Promise<{ message: string; assessment: Assessment }> => {
    const response = await api.post('/api/assessment/submit', {
      assessment_data: assessmentData,
    });
    return response.data;
  },

  getHistory: async (
    page = 1,
    perPage = 10
  ): Promise<{
    assessments: Assessment[];
    total: number;
    pages: number;
    current_page: number;
  }> => {
    const response = await api.get('/api/assessment/history', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  getById: async (id: number): Promise<{ assessment: Assessment }> => {
    const response = await api.get(`/api/assessment/${id}`);
    return response.data;
  },

  getTrends: async (
    days = 180
  ): Promise<{ trends: TrendData[]; statistics: Statistics }> => {
    const response = await api.get('/api/assessment/trends', {
      params: { days },
    });
    return response.data;
  },

  getFeatureImportance: async (): Promise<{
    feature_importance: FeatureImportance[];
  }> => {
    const response = await api.get('/api/assessment/feature-importance');
    return response.data;
  },

  updateNotes: async (
    id: number,
    notes: string
  ): Promise<{ message: string; assessment: Assessment }> => {
    const response = await api.put(`/api/assessment/${id}/notes`, { notes });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/admin/dashboard');
    return response.data;
  },

  getUsers: async (
    page = 1,
    perPage = 20
  ): Promise<{
    users: Array<User & { assessment_count: number; latest_stress_level: string | null }>;
    total: number;
    pages: number;
    current_page: number;
  }> => {
    const response = await api.get('/api/admin/users', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  getUserAssessments: async (
    userId: number,
    page = 1,
    perPage = 10
  ): Promise<{
    user: User;
    assessments: Assessment[];
    total: number;
    pages: number;
    current_page: number;
  }> => {
    const response = await api.get(`/api/admin/users/${userId}/assessments`, {
      params: { page, per_page: perPage },
    });
    return response.data;
  },

  getHighRiskAlerts: async (): Promise<{
    alerts: Array<{
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
    }>;
  }> => {
    const response = await api.get('/api/admin/high-risk-alerts');
    return response.data;
  },

  exportData: async (): Promise<{ data: any[]; count: number }> => {
    const response = await api.get('/api/admin/export-data');
    return response.data;
  },
};

export default api;
