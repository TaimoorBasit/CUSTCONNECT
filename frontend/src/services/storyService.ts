import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Story {
    id: string;
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    content?: string;
    createdAt: string;
    expiresAt: string;
    authorId: string;
    author: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    _count?: {
        views: number;
    };
}

export interface StoryFeedItem {
    author: Story['author'];
    stories: Story[];
}

export const storyService = {
    getFeed: async (): Promise<StoryFeedItem[]> => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/stories/feed`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.feed;
    },

    createStory: async (formData: FormData): Promise<Story> => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/stories`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.story;
    },

    viewStory: async (storyId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/stories/${storyId}/view`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },

    deleteStory: async (storyId: string): Promise<void> => {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/stories/${storyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
};
