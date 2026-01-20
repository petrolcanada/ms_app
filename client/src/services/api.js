import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - can be used to add auth tokens, logging, etc.
api.interceptors.request.use(
  (config) => {
    // Log request for debugging (can be removed in production)
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and transform responses
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (can be removed in production)
    console.log(`API Response: ${response.config.url}`, response.status);
    return response;
  },
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

// API service methods
export const fundService = {
  // Get all funds with optional filters and pagination
  getAllFunds: (params = {}) => {
    return api.get('/api/funds', { params });
  },
  
  // Get a single fund by ID
  getFundById: (id) => {
    return api.get(`/api/funds/${id}`);
  },
  
  // Get fund rankings by category
  getRankingsByCategory: (category) => {
    return api.get(`/api/funds/rankings/${category}`);
  },
};

export const categoryService = {
  // Get category performance data
  getCategoryPerformance: () => {
    return api.get('/api/categories/performance');
  },
};

export default api;
