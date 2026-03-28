import axios from 'axios';
import { storage } from '../utils/storage';

/**
 * Backend API base URL.
 * 
 * Always use the deployed Railway backend so it works on both:
 *  - Physical Android/iOS devices
 *  - Android emulators
 *  - Expo Go app
 * 
 * If you want to test against local backend during dev, change this to
 * your computer's local IP address: http://192.168.x.x:5000/api
 */
const BASE_URL = 'https://custconnect-backend-production.up.railway.app/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 45000, // Increased timeout for Railway cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
    try {
        const token = await storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // Ignore storage read errors
    }
    return config;
});

// Global error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. Please check your internet connection.';
        } else if (!error.response) {
            error.message = 'Cannot reach the server. Please check your internet connection.';
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const gpaApi = {
    calculate: (data) => api.post('/gpa/calculate', data),
    getHistory: () => api.get('/gpa/history'),
    getCurrent: () => api.get('/gpa/current'),
};

export const resourcesApi = {
    getAll: (params) => api.get('/resources', { params }),
    upload: (formData) => api.post('/resources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
