import axios, { AxiosInstance, AxiosResponse } from 'axios';

class VendorService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ CAFE OPERATIONS ============

  async getMyCafe(): Promise<any | null> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/vendor/cafe');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch cafe');
      }

      return response.data.cafe || null;
    } catch (error: any) {
      console.error('Failed to fetch cafe:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch cafe');
      }
      throw error;
    }
  }

  async updateCafeMenu(cafeId: string, menus: Array<{
    name: string;
    description?: string;
    price: number;
    category: string;
    isAvailable?: boolean;
  }>): Promise<void> {
    try {
      const response: AxiosResponse<any> = await this.api.put(`/vendor/cafes/${cafeId}/menu`, { menus });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update menu');
      }
    } catch (error: any) {
      console.error('Failed to update menu:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update menu');
      }
      throw error;
    }
  }

  async updateCafeDeals(cafeId: string, deals: Array<{
    title: string;
    description?: string;
    discount?: number;
    validFrom: string;
    validUntil: string;
    isActive?: boolean;
  }>): Promise<void> {
    try {
      const response: AxiosResponse<any> = await this.api.put(`/vendor/cafes/${cafeId}/deals`, { deals });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update deals');
      }
    } catch (error: any) {
      console.error('Failed to update deals:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update deals');
      }
      throw error;
    }
  }

  // ============ BUS OPERATIONS ============

  async getMyBusRoutes(): Promise<any[]> {
    try {
      const response: AxiosResponse<any> = await this.api.get('/vendor/buses');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch bus routes');
      }

      return response.data.routes || [];
    } catch (error: any) {
      console.error('Failed to fetch bus routes:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to fetch bus routes');
      }
      throw error;
    }
  }

  async updateBusSchedule(routeId: string, schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>): Promise<void> {
    try {
      const response: AxiosResponse<any> = await this.api.put(`/vendor/buses/${routeId}/schedule`, { schedules });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update schedule');
      }
    } catch (error: any) {
      console.error('Failed to update schedule:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update schedule');
      }
      throw error;
    }
  }

  async updateBusRoute(routeId: string, data: {
    busNumber?: string;
    driverContactNumber?: string;
    description?: string;
  }): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.put(`/vendor/buses/${routeId}`, data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update bus route');
      }

      return response.data.route;
    } catch (error: any) {
      console.error('Failed to update bus route:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to update bus route');
      }
      throw error;
    }
  }

  async sendBusNotification(routeId: string, data: {
    title: string;
    message: string;
    type?: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  }): Promise<void> {
    try {
      const response: AxiosResponse<any> = await this.api.post(`/vendor/buses/${routeId}/notify`, data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || 'Failed to send notification');
      }
      throw error;
    }
  }
}

export const vendorService = new VendorService();

