import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class AdminService {
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
  }

  // Users
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    const response: AxiosResponse<ApiResponse<{ users: any[]; pagination: any }>> = 
      await this.api.get('/admin/users', { params });
    return response.data.data!;
  }

  async assignRole(userId: string, roleId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post(`/admin/users/${userId}/roles`, { roleId });
    return response.data;
  }

  async removeRole(userId: string, roleId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.put(`/admin/users/${userId}/suspend`, { suspend: !isActive });
    return response.data;
  }

  async createUser(data: any) {
    const response: AxiosResponse<ApiResponse<{ user: any }>> = 
      await this.api.post('/admin/users', data);
    return response.data.data!.user;
  }

  async deleteUser(userId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async resetUserPassword(userId: string) {
    const response: AxiosResponse<ApiResponse<{ tempPassword: string }>> = 
      await this.api.post(`/admin/users/${userId}/reset-password`);
    return response.data.data!.tempPassword;
  }

  // Roles
  async getRoles() {
    const response: AxiosResponse<ApiResponse<{ roles: any[] }>> = 
      await this.api.get('/admin/roles');
    if (response.data.data) {
      return response.data.data.roles;
    }
    // Fallback for old response format
    return (response.data as any).roles || [];
  }

  // Vendors
  async getVendors() {
    const response: AxiosResponse<ApiResponse<{ vendors: any[] }>> = 
      await this.api.get('/admin/vendors');
    return response.data.data!.vendors;
  }

  async approveVendor(vendorId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post(`/admin/vendors/${vendorId}/approve`);
    return response.data;
  }

  // Cafes
  async getCafes() {
    const response: AxiosResponse<ApiResponse<{ cafes: any[] }>> = 
      await this.api.get('/admin/cafes');
    return response.data.data!.cafes;
  }

  async createCafe(data: any) {
    const response: AxiosResponse<ApiResponse<{ cafe: any }>> = 
      await this.api.post('/admin/cafes', data);
    return response.data.data!.cafe;
  }

  async updateCafe(cafeId: string, data: any) {
    const response: AxiosResponse<ApiResponse<{ cafe: any }>> = 
      await this.api.put(`/admin/cafes/${cafeId}`, data);
    return response.data.data!.cafe;
  }

  async deleteCafe(cafeId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/cafes/${cafeId}`);
    return response.data;
  }

  async assignCafeToOwner(cafeId: string, ownerId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post(`/admin/cafes/${cafeId}/assign`, { ownerId });
    return response.data;
  }

  // Bus Routes
  async getBusRoutes() {
    const response: AxiosResponse<ApiResponse<{ routes: any[] }>> = 
      await this.api.get('/admin/buses');
    return response.data.data!.routes;
  }

  async createBusRoute(data: any) {
    const response: AxiosResponse<ApiResponse<{ route: any }>> = 
      await this.api.post('/admin/buses', data);
    return response.data.data!.route;
  }

  async updateBusRoute(routeId: string, data: any) {
    const response: AxiosResponse<ApiResponse<{ route: any }>> = 
      await this.api.put(`/admin/buses/${routeId}`, data);
    return response.data.data!.route;
  }

  async deleteBusRoute(routeId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/buses/${routeId}`);
    return response.data;
  }

  // Analytics
  async getAnalytics() {
    const response: AxiosResponse<ApiResponse<{ analytics: any }>> = 
      await this.api.get('/admin/analytics');
    return response.data.data!.analytics;
  }

  // Audit Logs
  async getAuditLogs(filter?: string, limit?: number, entityType?: string, dateFilter?: string) {
    try {
      const params: any = {};
      if (filter && filter !== 'all') params.filter = filter;
      if (limit) params.limit = limit;
      if (entityType && entityType !== 'all') params.entityType = entityType;
      
      const response: AxiosResponse<ApiResponse<{ logs: any[]; total?: number }>> = 
        await this.api.get('/admin/audit', { params });
      if (response.data.data && response.data.data.logs) {
        return response.data.data.logs;
      }
      return [];
    } catch (error: any) {
      console.error('Audit log fetch error:', error);
      // Return empty array on error instead of throwing
      return [];
    }
  }

  // Universities
  async getUniversities() {
    try {
      const response: AxiosResponse<ApiResponse<{ universities: any[] }>> = 
        await this.api.get('/admin/universities');
      if (response.data.data && response.data.data.universities) {
        return response.data.data.universities;
      }
      // Fallback for old response format
      if ((response.data as any).universities) {
        return (response.data as any).universities;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch universities:', error);
      return [];
    }
  }

  // Posts Moderation
  async getPosts(params?: { page?: number; limit?: number; universityId?: string; showAll?: boolean; reportedOnly?: boolean }) {
    const response: AxiosResponse<ApiResponse<{ posts: any[]; pagination: any }>> = 
      await this.api.get('/admin/posts', { params });
    return response.data.data!;
  }

  async deletePost(postId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/posts/${postId}`);
    return response.data;
  }

  async sendWarningToUser(userId: string, message: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post(`/admin/users/${userId}/warning`, { message });
    return response.data;
  }

  // Resources
  async getResources(params?: { page?: number; limit?: number; universityId?: string }) {
    const response: AxiosResponse<ApiResponse<{ resources: any[]; pagination: any }>> = 
      await this.api.get('/admin/resources', { params });
    return response.data.data!;
  }

  async deleteResource(resourceId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/resources/${resourceId}`);
    return response.data;
  }

  // Events
  async getEvents(params?: { page?: number; limit?: number; universityId?: string }) {
    const response: AxiosResponse<ApiResponse<{ events: any[]; pagination: any }>> = 
      await this.api.get('/admin/events', { params });
    return response.data.data!;
  }

  async deleteEvent(eventId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/events/${eventId}`);
    return response.data;
  }

  // Notifications
  async getNotifications(params?: { page?: number; limit?: number; userId?: string; type?: string }) {
    const response: AxiosResponse<ApiResponse<{ notifications: any[]; pagination: any }>> = 
      await this.api.get('/admin/notifications', { params });
    return response.data.data!;
  }

  async createNotification(data: { title: string; message: string; type?: string; userId?: string; universityId?: string }) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post('/admin/notifications', data);
    return response.data;
  }

  async deleteNotification(notificationId: string) {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/admin/notifications/${notificationId}`);
    return response.data;
  }
}

export const adminService = new AdminService();

