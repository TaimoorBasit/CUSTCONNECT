import axios, { AxiosInstance, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { User, RegisterData, ApiResponse } from '@/types';

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      // We are forcing the production URL here to ensure connection
      baseURL: 'https://custconnect-backend-production.up.railway.app/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout for cold starts
      withCredentials: false,
    });

    // Configure retry logic
    axiosRetry(this.api, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ? error.response.status >= 500 : false);
      }
    });

    // Add token to requests with retry logic
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        // Clean token (remove any whitespace)
        const cleanToken = token.trim();
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    // Handle token expiration and network errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
          console.error('❌ Network error:', {
            message: error.message,
            code: error.code,
            baseURL: this.api.defaults.baseURL,
            url: error.config?.url
          });

          // If it's a network error and we're not on login page, show error
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
              console.error('Backend server may be down. Please check if the server is running.');
            }
          }

          // Return a formatted error
          return Promise.reject({
            ...error,
            message: 'Network error. Please check if the backend server is running.',
            isNetworkError: true
          });
        }

        // Handle 401 errors - but NOT for login/register endpoints
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const requestUrl = error.config?.url || '';

          // Don't redirect if already on login/register pages or if it's an auth endpoint
          if (!currentPath.startsWith('/auth/') && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
            // Clear invalid token
            localStorage.removeItem('token');
            // Only redirect if not already on login page
            if (currentPath !== '/auth/login' && currentPath !== '/login') {
              setTimeout(() => {
                window.location.href = '/auth/login';
              }, 100);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> =
        await this.api.post('/auth/login', {
          email: normalizedEmail,
          password: password.trim()
        }, {
          timeout: 15000, // 15 second timeout
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });

      // Handle response
      if (response.status === 401) {
        const customError: any = new Error(response.data?.message || 'Invalid email or password');
        customError.data = response.data;
        throw customError;
      }

      if (response.status >= 400) {
        throw new Error(response.data?.message || `Login failed: ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      if (!response.data.data) {
        throw new Error('Invalid response from server');
      }

      return response.data.data;
    } catch (error: any) {
      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        throw new Error('Connection failed. Please ensure the account is registered and you have a stable internet connection.');
      }

      // Handle 401 errors specifically
      if (error.response?.status === 401) {
        const customError: any = new Error(error.response.data?.message || 'Invalid email or password');
        customError.data = error.response.data;
        throw customError;
      }

      // Handle other HTTP errors
      if (error.response) {
        const message = error.response.data?.message || `Login failed: ${error.response.status}`;
        throw new Error(message);
      }

      // Handle other errors
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }

  async register(userData: RegisterData): Promise<void> {
    try {
      // Ensure all required fields are present and properly formatted
      const registrationPayload = {
        email: userData.email?.trim() || '',
        password: userData.password || '',
        firstName: userData.firstName?.trim() || '',
        lastName: userData.lastName?.trim() || '',
        ...(userData.year ? { year: typeof userData.year === 'string' ? parseInt(userData.year, 10) : userData.year } : {}),
        ...(userData.studentId?.trim() ? { studentId: userData.studentId.trim() } : {}),
        ...(userData.universityId ? { universityId: userData.universityId } : {}),
        ...(userData.departmentId ? { departmentId: userData.departmentId } : {}),
      };

      const response: AxiosResponse<ApiResponse<void>> =
        await this.api.post('/auth/register', registrationPayload);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Registration API Error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        const errorMessage = error.response.data?.message || `Registration failed: ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      } else {
        throw new Error(error.message || 'Registration failed');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response: AxiosResponse<any> =
        await this.api.get('/auth/me', {
          timeout: 10000, // 10 second timeout
        });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to get user data');
      }

      // Handle both response structures
      if (response.data.user) {
        return response.data.user;
      }

      if (response.data.data?.user) {
        return response.data.data.user;
      }

      throw new Error('Invalid response format');
    } catch (error: any) {
      // Handle network errors
      if (error.isNetworkError || error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        console.error('Network error in getCurrentUser:', {
          message: error.message,
          code: error.code,
          baseURL: this.api.defaults.baseURL,
          url: '/auth/me'
        });
        // Don't clear token on network error - might be temporary
        throw new Error('Unable to connect to server. Please check your internet connection and ensure the backend server is running.');
      }

      // If it's a 401, clear token and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Session expired. Please login again.');
      }

      // Re-throw the error with a user-friendly message
      throw new Error(error.response?.data?.message || error.message || 'Failed to get current user');
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<any> =
      await this.api.put('/users/profile', data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update profile');
    }

    if (response.data.user) {
      return response.data.user;
    }

    if (response.data.data?.user) {
      return response.data.data.user;
    }

    throw new Error('Invalid response format');
  }

  async verifyEmail(email: string, otp: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> =
      await this.api.post('/auth/verify-email', { email, otp });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Email verification failed');
    }
  }

  async resendOTP(email: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> =
      await this.api.post('/auth/resend-otp', { email });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to resend OTP');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> =
      await this.api.post('/auth/forgot-password', { email });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password reset request failed');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> =
      await this.api.post('/auth/reset-password', { token, password });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password reset failed');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> =
      await this.api.post('/auth/change-password', { currentPassword, newPassword });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Password change failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Ignore errors - logout should always succeed locally
      console.error('Logout API error:', error);
    }
  }
}

export const authService = new AuthService();









