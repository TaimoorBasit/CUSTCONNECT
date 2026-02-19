import axios, { AxiosInstance } from 'axios';

export interface LostFoundItem {
  id: string;
  title: string;
  description?: string;
  category: 'Lost' | 'Found';
  itemType?: string;
  location?: string;
  contactInfo?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'CLOSED';
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  universityId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  university?: {
    id: string;
    name: string;
  };
}

class LostFoundService {
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

  async getItems(params?: { category?: string; status?: string; universityId?: string }): Promise<LostFoundItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.universityId) queryParams.append('universityId', params.universityId);

    const response = await this.api.get(`/lost-found?${queryParams.toString()}`);
    return response.data.items || [];
  }

  async getItem(id: string): Promise<LostFoundItem> {
    const response = await this.api.get(`/lost-found/${id}`);
    return response.data.item;
  }

  async createItem(data: {
    title: string;
    description?: string;
    category: 'Lost' | 'Found';
    itemType?: string;
    location?: string;
    contactInfo?: string;
  }): Promise<LostFoundItem> {
    const response = await this.api.post('/lost-found', data);
    return response.data.item;
  }

  async uploadImage(itemId: string, file: File): Promise<LostFoundItem> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await this.api.post(`/lost-found/${itemId}/image`, formData, {
      timeout: 30000,
    });
    return response.data.item;
  }

  async resolveItem(itemId: string, resolvedBy?: string): Promise<LostFoundItem> {
    const response = await this.api.put(`/lost-found/${itemId}/resolve`, { resolvedBy });
    return response.data.item;
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.api.delete(`/lost-found/${itemId}`);
  }
}

export const lostFoundService = new LostFoundService();

