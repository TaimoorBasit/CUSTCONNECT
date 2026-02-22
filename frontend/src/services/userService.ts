import axios, { AxiosResponse } from 'axios';
import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class UserService {
    private api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    async getUserProfile(): Promise<User> {
        const response: AxiosResponse<any> = await this.api.get('/users/profile');
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch profile');
        }
        return response.data.user;
    }

    async getUserById(id: string): Promise<User> {
        const response: AxiosResponse<any> = await this.api.get(`/users/${id}`);
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch user');
        }
        return response.data.user;
    }

    async followUser(userId: string): Promise<void> {
        const response: AxiosResponse<any> = await this.api.post('/users/follow', { userId });
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to follow user');
        }
    }

    async unfollowUser(userId: string): Promise<void> {
        const response: AxiosResponse<any> = await this.api.delete('/users/follow', { data: { userId } });
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to unfollow user');
        }
    }

    async getFollowers(userId: string, params?: { page?: number; limit?: number }): Promise<{ followers: User[]; pagination: any }> {
        const response: AxiosResponse<any> = await this.api.get(`/users/${userId}/followers`, { params });
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch followers');
        }
        return {
            followers: response.data.followers,
            pagination: response.data.pagination
        };
    }

    async getFollowing(userId: string, params?: { page?: number; limit?: number }): Promise<{ following: User[]; pagination: any }> {
        const response: AxiosResponse<any> = await this.api.get(`/users/${userId}/following`, { params });
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch following');
        }
        return {
            following: response.data.following,
            pagination: response.data.pagination
        };
    }

    async searchUsers(query: string): Promise<User[]> {
        const response: AxiosResponse<any> = await this.api.get('/users/search', { params: { q: query } });
        if (!response.data.success) {
            throw new Error(response.data.message || 'Search failed');
        }
        return response.data.users;
    }
}

export const userService = new UserService();

