import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface Conversation {
    id: string;
    name?: string;
    imageUrl?: string;
    isGroup: boolean;
    partner?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
    lastMessage: string;
    lastMessageAt: string;
    unread: boolean;
    members?: any[];
    messages?: Message[];
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    createdAt: string;
    sender?: {
        id: string;
        firstName: string;
        lastName: string;
        profileImage?: string;
    };
}

export const chatService = {
    getConversations: async (): Promise<Conversation[]> => {
        const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/messages/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.conversations;
    },

    getDirectConversation: async (userId: string): Promise<Conversation> => {
        const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/messages/direct/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.conversation;
    },

    getConversation: async (id: string): Promise<Conversation> => {
        const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/messages/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.conversation;
    },

    createGroup: async (name: string, members: string[]): Promise<Conversation> => {
        const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/messages/group`, { name, members }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.conversation;
    },

    sendMessage: async (conversationId: string, content: string): Promise<Message> => {
        const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/messages/${conversationId}`, { content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.message;
    },

    // Backward compatibility
    sendDirectMessage: async (userId: string, content: string): Promise<Message> => {
        const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/messages`, { userId, content }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.message;
    }
};

