/**
 * API Service
 * Axios instance with Firebase Auth token injection
 * All API calls go through this module
 */
import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:5000/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Token expired or invalid — redirect to login
      if (status === 401) {
        console.warn('Unauthorized — redirecting to login');
        // Don't force redirect here, let components handle it
      }

      // Return the error message from backend
      const message = data?.message || 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }

    // Network error
    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(error);
  }
);

export default api;
