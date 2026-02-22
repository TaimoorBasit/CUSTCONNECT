import axios, { AxiosResponse } from 'axios';
import { ApiResponse, Event } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class EventService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getEvents(params?: { page?: number; limit?: number; universityOnly?: boolean }): Promise<{ events: Event[]; pagination: any }> {
    const response: AxiosResponse<any> = 
      await this.api.get('/events', { params });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch events');
    }
    
    // Handle both response structures
    if (response.data.events) {
      return {
        events: response.data.events,
        pagination: response.data.pagination || {}
      };
    }
    
    if (response.data.data?.events) {
      return response.data.data;
    }
    
    return { events: [], pagination: {} };
  }

  async createEvent(data: { title: string; description?: string; location?: string; startDate: string; endDate?: string }): Promise<Event> {
    const response: AxiosResponse<any> = 
      await this.api.post('/events', data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create event');
    }
    
    // Handle both response structures
    if (response.data.event) {
      return response.data.event;
    }
    
    if (response.data.data?.event) {
      return response.data.data.event;
    }
    
    throw new Error('Invalid response format');
  }

  async updateEvent(eventId: string, data: { title?: string; description?: string; location?: string; startDate?: string; endDate?: string }): Promise<Event> {
    const response: AxiosResponse<any> = 
      await this.api.put(`/events/${eventId}`, data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update event');
    }
    
    if (response.data.event) {
      return response.data.event;
    }
    
    if (response.data.data?.event) {
      return response.data.data.event;
    }
    
    throw new Error('Invalid response format');
  }

  async deleteEvent(eventId: string): Promise<void> {
    const response: AxiosResponse<any> = 
      await this.api.delete(`/events/${eventId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete event');
    }
  }

  async rsvpEvent(eventId: string, status: 'GOING' | 'NOT_GOING' | 'MAYBE'): Promise<{ status: string }> {
    const response: AxiosResponse<any> = 
      await this.api.post(`/events/${eventId}/rsvp`, { status });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to RSVP');
    }
    
    if (response.data.status) {
      return { status: response.data.status };
    }
    
    if (response.data.data?.status) {
      return { status: response.data.data.status };
    }
    
    return { status: 'GOING' };
  }

  async getMyEvents(): Promise<{ events: Event[] }> {
    const response: AxiosResponse<any> = 
      await this.api.get('/events/my/events');
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch my events');
    }
    
    if (response.data.events) {
      return { events: response.data.events };
    }
    
    if (response.data.data?.events) {
      return response.data.data;
    }
    
    return { events: [] };
  }
}

export const eventService = new EventService();


