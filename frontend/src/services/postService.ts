import axios, { AxiosResponse } from 'axios';
import { ApiResponse, Post } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class PostService {
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

  async getPosts(params?: { page?: number; limit?: number; universityOnly?: boolean; followingOnly?: boolean }): Promise<{ posts: Post[]; pagination: any }> {
    const response: AxiosResponse<any> =
      await this.api.get('/posts', { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch posts');
    }

    // Handle both response structures
    if (response.data.posts) {
      return {
        posts: response.data.posts,
        pagination: response.data.pagination || {}
      };
    }

    if (response.data.data?.posts) {
      return response.data.data;
    }

    return { posts: [], pagination: {} };
  }

  async getUserPosts(userId: string, params?: { page?: number; limit?: number }): Promise<{ posts: Post[]; pagination: any }> {
    const response: AxiosResponse<any> =
      await this.api.get(`/posts/user/${userId}`, { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user posts');
    }

    return {
      posts: response.data.posts,
      pagination: response.data.pagination || {}
    };
  }

  async createPost(data: { content: string; imageUrl?: string; videoUrl?: string; privacy?: 'PUBLIC' | 'UNIVERSITY_ONLY' | 'FOLLOWERS_ONLY' }): Promise<Post> {
    const response: AxiosResponse<any> =
      await this.api.post('/posts', data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create post');
    }

    // Handle both response structures
    if (response.data.post) {
      return response.data.post;
    }

    if (response.data.data?.post) {
      return response.data.data.post;
    }

    throw new Error('Invalid response format');
  }

  async uploadPostFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/posts/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to upload file');
    }

    return response.data.fileUrl;
  }

  async updatePost(postId: string, data: { content?: string; imageUrl?: string; videoUrl?: string; privacy?: 'PUBLIC' | 'UNIVERSITY_ONLY' | 'FOLLOWERS_ONLY' }): Promise<Post> {
    const response: AxiosResponse<any> =
      await this.api.put(`/posts/${postId}`, data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update post');
    }

    if (response.data.post) {
      return response.data.post;
    }

    if (response.data.data?.post) {
      return response.data.data.post;
    }

    throw new Error('Invalid response format');
  }

  async deletePost(postId: string): Promise<void> {
    const response: AxiosResponse<any> =
      await this.api.delete(`/posts/${postId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete post');
    }
  }

  async likePost(postId: string): Promise<{ liked: boolean }> {
    const response: AxiosResponse<any> =
      await this.api.post(`/posts/${postId}/like`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to like post');
    }

    if (response.data.liked !== undefined) {
      return { liked: response.data.liked };
    }

    if (response.data.data?.liked !== undefined) {
      return { liked: response.data.data.liked };
    }

    return { liked: false };
  }

  async addComment(postId: string, content: string): Promise<any> {
    const response: AxiosResponse<any> =
      await this.api.post(`/posts/${postId}/comment`, { content });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add comment');
    }

    if (response.data.comment) {
      return response.data.comment;
    }

    if (response.data.data?.comment) {
      return response.data.data.comment;
    }

    throw new Error('Invalid response format');
  }

  async getComments(postId: string, params?: { page?: number; limit?: number }): Promise<{ comments: any[]; pagination: any }> {
    const response: AxiosResponse<any> =
      await this.api.get(`/posts/${postId}/comments`, { params });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch comments');
    }

    if (response.data.comments) {
      return {
        comments: response.data.comments,
        pagination: response.data.pagination || {}
      };
    }

    if (response.data.data?.comments) {
      return response.data.data;
    }

    return { comments: [], pagination: {} };
  }

  async updateComment(commentId: string, content: string): Promise<any> {
    const response: AxiosResponse<any> =
      await this.api.put(`/posts/comments/${commentId}`, { content });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update comment');
    }

    if (response.data.comment) {
      return response.data.comment;
    }

    if (response.data.data?.comment) {
      return response.data.data.comment;
    }

    throw new Error('Invalid response format');
  }

  async deleteComment(commentId: string): Promise<void> {
    const response: AxiosResponse<any> =
      await this.api.delete(`/posts/comments/${commentId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete comment');
    }
  }

  async reportPost(postId: string, reason?: string): Promise<void> {
    const response: AxiosResponse<any> =
      await this.api.post(`/posts/${postId}/report`, { reason });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to report post');
    }
  }
}

export const postService = new PostService();


