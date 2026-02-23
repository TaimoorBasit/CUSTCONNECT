import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface GPASubject {
    name: string;
    code: string;
    credits: number;
    grade: string;
    gpa?: number;
}

export interface GPARecord {
    id: string;
    semester: string;
    year: string;
    gpa: number;
    cgpa: number;
    credits: number;
    createdAt: string;
    subjects: GPASubject[];
}

export const gpaService = {
    calculateGPA: async (data: { subjects: GPASubject[]; semester: string; year: string }) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.post(`${API_URL}/gpa/calculate`, data, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    getHistory: async (page = 1, limit = 10) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/gpa/history`, {
            params: { page, limit },
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    getCurrentStatus: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/gpa/current`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    getTips: async () => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.get(`${API_URL}/gpa/tips`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },

    deleteRecord: async (id: string) => {
        const token = typeof window !== 'undefined' ? (localStorage.getItem('cc_token') || localStorage.getItem('token')) : null;
        const response = await axios.delete(`${API_URL}/gpa/${id}`, {
            headers: { Authorization: `Bearer ${token?.trim()}` },
        });
        return response.data;
    },
};
