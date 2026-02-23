import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Resource {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    uploaderId: string;
    courseId: string;
    semesterId: string;
    createdAt: string;
    uploader: {
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    course?: {
        name: string;
        code: string;
    };
    semester?: {
        name: string;
    };
}

export const resourceService = {
    getResources: async (params: any) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/resources`, {
            params,
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    uploadResource: async (data: any) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.post(`${API_URL}/resources`, data, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    getCourses: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/resources/courses/list`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    getSemesters: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/resources/semesters/list`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    downloadResource: async (id: string) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/resources/${id}/download`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    deleteResource: async (id: string) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.delete(`${API_URL}/resources/${id}`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },
};
