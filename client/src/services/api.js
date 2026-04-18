import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fundlens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`API Error ${status}:`, data);
      
      // Transform error to user-friendly message
      let userMessage = 'An error occurred while fetching data.';
      
      switch (status) {
        case 400:
          userMessage = data.error?.message || 'Invalid request. Please check your input.';
          break;
        case 404:
          userMessage = data.error?.message || 'The requested resource was not found.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        case 503:
          userMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          userMessage = data.error?.message || 'An unexpected error occurred.';
      }
      
      // Create a user-friendly error object
      const userError = new Error(userMessage);
      userError.status = status;
      userError.originalError = error;
      
      return Promise.reject(userError);
    } else if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network Error:', error.message);
      const networkError = new Error('Network error. Please check your internet connection.');
      networkError.originalError = error;
      return Promise.reject(networkError);
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

const DOMAIN_KEY_TO_PATH = {
  basicInfo: 'basic-info',
  performance: 'performance',
  rankings: 'rankings',
  fees: 'fees',
  ratings: 'ratings',
  risk: 'risk',
  flows: 'flows',
  assets: 'assets',
  categoryPerformance: 'category-performance',
};

export const fundService = {
  getAllFunds: (params = {}) => {
    return api.get('/api/funds', { params });
  },

  getFundById: (id) => {
    return api.get(`/api/funds/${id}`);
  },

  fetchDomain: (domainKey, fundIds, asofDate) => {
    const path = DOMAIN_KEY_TO_PATH[domainKey] || domainKey;
    return api.post(`/api/funds/domains/${path}`, { fundIds, asofDate });
  },

  fetchMultipleDomains: (domains, fundIds, asofDate) => {
    const body = { domains, fundIds };
    if (asofDate) body.asofDate = asofDate;
    return api.post('/api/funds/domains', body);
  },

  getScreenerData: (params = {}) => {
    return api.get('/api/funds/screener', { params, timeout: 30000 });
  },
};

export const dateService = {
  getAvailableDates: () => {
    return api.get('/api/funds/domains/available-dates');
  },
};

export const historyService = {
  getPerformanceHistory: (fundId, startDate, endDate) => {
    return api.get(`/api/funds/${fundId}/history/performance`, {
      params: { startDate, endDate },
    });
  },
  getFlowHistory: (fundId, startDate, endDate) => {
    return api.get(`/api/funds/${fundId}/history/flows`, {
      params: { startDate, endDate },
    });
  },
  getAssetsHistory: (fundId, startDate, endDate) => {
    return api.get(`/api/funds/${fundId}/history/assets`, {
      params: { startDate, endDate },
    });
  },
  getCategoryPerformanceHistory: (fundId, startDate, endDate) => {
    return api.get(`/api/funds/${fundId}/history/category-performance`, {
      params: { startDate, endDate },
    });
  },
};

export const dashboardService = {
  getDashboard: (params = {}) => {
    return api.get('/api/dashboard', { params });
  },
  getCategoryOverview: (category, params = {}) => {
    return api.get(`/api/dashboard/category/${encodeURIComponent(category)}`, { params });
  },
};

export const categoryService = {
  getCategories: () => {
    return api.get('/api/categories');
  },
};

export const watchlistApiService = {
  getAll: () => api.get('/api/watchlist'),
  add: (item) => api.post('/api/watchlist', item),
  remove: (fundId) => api.delete(`/api/watchlist/${fundId}`),
  clear: () => api.delete('/api/watchlist'),
  sync: (items) => api.post('/api/watchlist/sync', { items }),
};

export const userApiService = {
  updateProfile: (data) => api.patch('/api/users/profile', data),
  updatePassword: (data) => api.patch('/api/users/password', data),
  deleteAccount: () => api.delete('/api/users'),
  getSubscription: () => api.get('/api/users/subscription'),
};

export const checkoutService = {
  createSession: () => api.post('/api/checkout/create-session'),
  createPortal: () => api.post('/api/checkout/portal'),
  getSubscription: () => api.get('/api/checkout/subscription'),
};

export default api;
