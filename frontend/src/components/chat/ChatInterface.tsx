'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import UserCircleIcon from '@heroicons/react/24/solid/UserCircleIcon';
import PaperAirplaneIcon from '@heroicons/react/24/solid/PaperAirplaneIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profileImage?: string;
    roles?: { role: { name: string } }[];
}

interface Conversation {
    partner: User;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
}

export default function ChatInterface() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('userId');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        const initChat = async () => {
            if (targetUserId) {
                // Check if we already have a conversation
                const existingConv = conversations.find(c => c.partner.id === targetUserId);
                if (existingConv) {
                    setSelectedPartner(existingConv.partner);
                } else {
                    // Fetch user details to start new conversation
                    try {
                        const token = localStorage.getItem('token');
                        const response = await axios.get(`${API_URL}/users/${targetUserId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (response.data.success) {
                            setSelectedPartner(response.data.user);
                        }
                    } catch (error) {
                        console.error('Error fetching user for chat:', error);
                        toast.error('Could not load user details');
                    }
                }
            }
        };

        if (conversations.length > 0 || targetUserId) {
            // If we have conversations loaded, check for target
            // Or if we just mounted and have a target, try to fetch it independent of convos if needed? 
            // Logic: run init if targetUserId exists. 
            // Dependency on conversations ensures we check against loaded list.
            initChat();
        }
    }, [targetUserId, conversations.length]); // Check when param changes or convos load

    useEffect(() => {
        if (selectedPartner) {
            fetchMessages(selectedPartner.id);
            // Optional: Set up polling or socket listener here
            const interval = setInterval(() => {
                fetchMessages(selectedPartner.id, true);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedPartner]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/messages/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setConversations(response.data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string, background = false) => {
        try {
            if (!background) setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/messages/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (!background) setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPartner || !newMessage.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/messages`, {
                receiverId: selectedPartner.id,
                content: newMessage
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessages([...messages, response.data.message]);
                setNewMessage('');
                fetchConversations(); // Update last message in sidebar
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading && !selectedPartner) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg h-[calc(100vh-8rem)] min-h-[500px] flex overflow-hidden">
            {/* Sidebar - Conversation List */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${selectedPartner ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                        Messages
                    </h2>
                </div>
                <div className="overflow-y-auto flex-1">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No conversations yet
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {conversations.map((conv) => (
                                <li
                                    key={conv.partner.id}
                                    onClick={() => setSelectedPartner(conv.partner)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPartner?.id === conv.partner.id ? 'bg-indigo-50' : ''}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            {conv.partner.profileImage ? (
                                                <img src={conv.partner.profileImage} alt="" className="h-10 w-10 rounded-full" />
                                            ) : (
                                                <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {conv.partner.firstName} {conv.partner.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(conv.timestamp)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                        {conv.unreadCount > 0 && (
                                            <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col ${!selectedPartner ? 'hidden md:flex' : 'flex'}`}>
                {selectedPartner ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center bg-white shadow-sm z-10">
                            <button
                                onClick={() => setSelectedPartner(null)}
                                className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
                            >
                                ← Back
                            </button>
                            <div className="flex-shrink-0 mr-3">
                                {selectedPartner.profileImage ? (
                                    <img src={selectedPartner.profileImage} alt="" className="h-10 w-10 rounded-full" />
                                ) : (
                                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {selectedPartner.firstName} {selectedPartner.lastName}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {selectedPartner.email}
                                </p>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg) => {
                                const isMe = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm break-words">{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {formatDate(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSendMessage} className="flex space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="inline-flex items-center justify-center rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-500 bg-gray-50">
                        <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
