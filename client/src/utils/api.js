import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('authToken');
    return Promise.resolve();
  },
};

export const expenseAPI = {
  getAll: () => api.get('/expenses'),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  downloadExcel: () => api.get('/expenses/download', { responseType: 'blob' }),
  getStats: () => api.get('/expenses/stats'),
};

export const eggProductionAPI = {
  getAll: () => api.get('/egg-production'),
  create: (data) => api.post('/egg-production', data),
  update: ({ date, timestamp, egg_count, feed_consumed }) =>
    api.put(`/egg-production/${date}/${timestamp}`, { egg_count, feed_consumed }),
  delete: ({ date, timestamp }) =>
    api.delete(`/egg-production/${date}/${timestamp}`),
};

export const recordsAPI = {
  download: (type) => {
    let url = '/records/download';
    if (type && (type === 'egg' || type === 'expense')) {
      url += `?type=${type}`;
    }
    return api.get(url, { responseType: 'blob' });
  },
};

export default api;
