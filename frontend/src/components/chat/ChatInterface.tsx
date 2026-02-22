'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { chatService, Conversation, Message } from '@/services/chatService';
import toast from 'react-hot-toast';
import {
    ChatBubbleLeftRightIcon,
    UserCircleIcon,
    PaperAirplaneIcon,
    PlusIcon,
    UserGroupIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { userService } from '@/services/userService';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ChatInterface() {
    const { user: currentUser } = useAuth();
    const { socket, onlineUsers } = useSocket();
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    // Sidebar DM search (separate from group creation search)
    const [dmSearchQuery, setDmSearchQuery] = useState('');
    const [dmSearchResults, setDmSearchResults] = useState<any[]>([]);
    const [dmSearching, setDmSearching] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('userId');

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (targetUserId) {
            handleDirectChat(targetUserId);
        }
    }, [targetUserId]);

    useEffect(() => {
        if (selectedConv && socket) {
            loadMessages(selectedConv.id);
            socket.emit('join-room', selectedConv.id);

            return () => {
                socket.emit('leave-room', selectedConv.id);
            };
        } else if (selectedConv) {
            loadMessages(selectedConv.id);
        }
    }, [selectedConv?.id, socket]);

    useEffect(() => {
        if (!socket || !selectedConv) return;

        const handleNewMessage = (data: { conversationId: string, message: Message }) => {
            if (data.conversationId === selectedConv.id) {
                setMessages(prev => {
                    const exists = prev.find(m => m.id === data.message.id);
                    if (exists) return prev;
                    return [...prev, data.message];
                });
                loadConversations(); // Refresh list to show last message
            }
        };

        socket.on('new-message', handleNewMessage);
        return () => {
            socket.off('new-message', handleNewMessage);
        };
    }, [socket, selectedConv?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (convId: string, background = false) => {
        try {
            const data = await chatService.getConversation(convId);
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleDirectChat = async (userId: string) => {
        try {
            const conv = await chatService.getDirectConversation(userId);
            setSelectedConv(conv);
            loadConversations();
        } catch (error) {
            toast.error('Could not open chat');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConv || !newMessage.trim()) return;

        try {
            const msg = await chatService.sendMessage(selectedConv.id, newMessage);
            setMessages([...messages, msg]);
            setNewMessage('');
            loadConversations(); // Refresh list to show last message
        } catch (error) {
            toast.error('Failed to send');
        }
    };

    const handleUserSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const results = await userService.searchUsers(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Search failed');
        }
    };

    const handleDmSearch = async (query: string) => {
        setDmSearchQuery(query);
        if (query.length < 2) {
            setDmSearchResults([]);
            return;
        }
        setDmSearching(true);
        try {
            const results = await userService.searchUsers(query);
            setDmSearchResults(results);
        } catch (error) {
            console.error('DM search failed');
        } finally {
            setDmSearching(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName || selectedMembers.length < 1) {
            toast.error('Please provide a name and members');
            return;
        }
        try {
            const conv = await chatService.createGroup(groupName, selectedMembers.map(m => m.id));
            toast.success('Group created!');
            setShowCreateGroup(false);
            setSelectedConv(conv);
            loadConversations();
        } catch (error) {
            toast.error('Failed to create group');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] min-h-[600px] bg-background/50 backdrop-blur-xl border border-border/10 rounded-[40px] overflow-hidden shadow-2xl">
            {/* Conversations Sidebar */}
            <div className={`w-full md:w-[380px] border-r border-border/10 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-b border-border/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black tracking-tight">Messages</h2>
                        <button
                            onClick={() => setShowCreateGroup(true)}
                            className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90"
                        >
                            <PlusIcon className="w-6 h-6 stroke-[3]" />
                        </button>
                    </div>
                    {/* Search box */}
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={dmSearchQuery}
                            onChange={(e) => handleDmSearch(e.target.value)}
                            placeholder="Search people..."
                            className="w-full bg-secondary/30 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                        />
                        {dmSearchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/10 rounded-2xl shadow-xl overflow-hidden z-30">
                                {dmSearchResults.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => {
                                            setDmSearchQuery('');
                                            setDmSearchResults([]);
                                            handleDirectChat(u.id);
                                        }}
                                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/40 text-left transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {u.profileImage
                                                ? <img src={u.profileImage} className="w-full h-full object-cover" alt="" />
                                                : <span className="text-xs font-black text-primary">{u.firstName[0]}</span>}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-black truncate">{u.firstName} {u.lastName}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium truncate">{u.email}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {dmSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="px-8 py-4 flex items-center gap-4 animate-pulse">
                                <div className="w-14 h-14 bg-secondary rounded-[22px]" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-secondary rounded-full w-24" />
                                    <div className="h-3 bg-secondary rounded-full w-full" />
                                </div>
                            </div>
                        ))
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                            <div className="w-20 h-20 bg-secondary/30 rounded-[30px] flex items-center justify-center mb-6">
                                <ChatBubbleLeftRightIcon className="w-10 h-10 text-muted-foreground/20" />
                            </div>
                            <h3 className="text-lg font-black text-foreground mb-1">No chats yet</h3>
                            <p className="text-sm text-muted-foreground font-medium">Messages from friends and vendors will appear here.</p>
                        </div>
                    ) : conversations.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => setSelectedConv(conv)}
                            className={`w-full px-8 py-4 flex items-center gap-4 hover:bg-secondary/20 transition-all group relative ${selectedConv?.id === conv.id ? 'bg-secondary/40' : ''}`}
                        >
                            {selectedConv?.id === conv.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
                            )}
                            <div className="relative">
                                <div className="w-14 h-14 rounded-[22px] bg-secondary/50 overflow-hidden flex items-center justify-center border-2 border-transparent group-hover:border-primary/20 transition-all">
                                    {conv.isGroup ? (
                                        <UserGroupIcon className="w-8 h-8 text-primary/40" />
                                    ) : conv.partner?.profileImage ? (
                                        <img src={conv.partner.profileImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="text-xl font-black text-primary/40">{conv.partner?.firstName[0]}</span>
                                    )}
                                </div>
                                {conv.unread && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-4 border-background" />
                                )}
                                {!conv.isGroup && conv.partner && onlineUsers.includes(conv.partner.id) && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-4 border-background" />
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-black text-sm truncate uppercase tracking-tight">
                                        {conv.isGroup ? conv.name : `${conv.partner?.firstName} ${conv.partner?.lastName}`}
                                    </h4>
                                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase">
                                        {formatDate(conv.lastMessageAt)}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${conv.unread ? 'font-black text-foreground' : 'font-medium text-muted-foreground/60'}`}>
                                    {conv.lastMessage || 'Start a conversation'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Content */}
            <div className={`flex-1 flex flex-col bg-secondary/5 ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
                {selectedConv ? (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 bg-background/50 backdrop-blur-md border-b border-border/5 flex items-center justify-between z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 hover:bg-secondary rounded-full transition-all">
                                    <ArrowLeftIcon className="w-6 h-6" />
                                </button>
                                <Link
                                    href={selectedConv.isGroup ? '#' : `/dashboard/profile?id=${selectedConv.partner?.id}`}
                                    className="w-12 h-12 rounded-[18px] bg-primary/10 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                                >
                                    {selectedConv.isGroup ? (
                                        <UserGroupIcon className="w-6 h-6 text-primary" />
                                    ) : selectedConv.partner?.profileImage ? (
                                        <img src={selectedConv.partner.profileImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="font-black text-primary">{selectedConv.partner?.firstName[0]}</span>
                                    )}
                                </Link>
                                <div>
                                    <Link
                                        href={selectedConv.isGroup ? '#' : `/dashboard/profile?id=${selectedConv.partner?.id}`}
                                        className="font-black text-lg uppercase tracking-tighter hover:text-primary transition-colors block leading-none"
                                    >
                                        {selectedConv.isGroup ? selectedConv.name : `${selectedConv.partner?.firstName} ${selectedConv.partner?.lastName}`}
                                    </Link>
                                    {!selectedConv.isGroup && selectedConv.partner && onlineUsers.includes(selectedConv.partner.id) && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">Active Now</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!selectedConv.isGroup && selectedConv.partner && (
                                <button
                                    onClick={() => router.push(`/dashboard/profile?id=${selectedConv.partner?.id}`)}
                                    className="p-3 bg-secondary/50 text-foreground hover:bg-primary hover:text-white rounded-[16px] transition-all active:scale-95 flex items-center gap-2 group"
                                    title="View Profile"
                                >
                                    <UserCircleIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Profile</span>
                                </button>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6">
                            {messages.map((msg, idx) => {
                                const isMe = msg.senderId === currentUser?.id;
                                const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                                return (
                                    <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isMe && (
                                            <div className="w-8 h-8 rounded-[12px] bg-secondary/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                                {showAvatar && (
                                                    msg.sender?.profileImage ? (
                                                        <img src={msg.sender.profileImage} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-[10px] font-black">{msg.sender?.firstName[0]}</span>
                                                    )
                                                )}
                                            </div>
                                        )}
                                        <div className={`max-w-[70%] space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && selectedConv.isGroup && showAvatar && (
                                                <span className="text-[10px] font-black text-muted-foreground/40 ml-1 uppercase">{msg.sender?.firstName}</span>
                                            )}
                                            <div className={`px-5 py-3 rounded-[22px] text-sm font-medium shadow-sm transition-all hover:scale-[1.02] ${isMe ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background text-foreground rounded-bl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase px-1">
                                                {formatDate(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="px-8 py-8 bg-background/50 border-t border-border/5">
                            <form
                                onSubmit={handleSendMessage}
                                className="bg-secondary/30 rounded-[28px] p-2 pr-4 flex items-center gap-2 group focus-within:ring-2 focus:ring-primary/20 transition-all border-2 border-transparent focus-within:border-primary/10"
                            >
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 py-3 px-4 font-bold text-sm placeholder:text-muted-foreground/30"
                                />
                                <button
                                    disabled={!newMessage.trim()}
                                    className="w-12 h-12 bg-primary text-white rounded-[18px] flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-90 transition-all disabled:opacity-20 disabled:scale-100"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45 -translate-y-0.5 translate-x-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40 group grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="w-32 h-32 bg-secondary rounded-[48px] flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform duration-500">
                            <ChatBubbleLeftRightIcon className="w-16 h-16 text-muted-foreground/20" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Your Inbox</h2>
                        <p className="max-w-xs font-black text-muted-foreground/60 leading-relaxed tracking-tight">Select a conversation or start a new group to connect with your campus colleagues.</p>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-background rounded-[40px] w-full max-w-md p-10 shadow-2xl relative">
                        <button onClick={() => setShowCreateGroup(false)} className="absolute top-8 right-8 p-2 hover:bg-secondary rounded-full transition-all">
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">New Group</h3>
                        <p className="text-muted-foreground text-sm font-medium mb-8">Create a multi-user conversation.</p>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Group Name</label>
                                <input
                                    type="text"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    placeholder="Campus Study Group..."
                                    className="w-full bg-secondary/30 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Search Members</label>
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleUserSearch(e.target.value)}
                                        placeholder="Type a name..."
                                        className="w-full bg-secondary/30 border-none rounded-2xl py-3 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border/10 rounded-2xl shadow-xl overflow-hidden z-20">
                                            {searchResults.map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => {
                                                        if (!selectedMembers.find(m => m.id === user.id)) {
                                                            setSelectedMembers([...selectedMembers, user]);
                                                        }
                                                        setSearchQuery('');
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/40 text-left"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                                                        {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold">{user.firstName[0]}</span>}
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-tight">{user.firstName} {user.lastName}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedMembers.map(m => (
                                        <div key={m.id} className="bg-primary/10 text-primary pl-3 pr-1 py-1 rounded-full flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{m.firstName}</span>
                                            <button onClick={() => setSelectedMembers(selectedMembers.filter(sm => sm.id !== m.id))} className="p-1 hover:bg-primary/20 rounded-full transition-all">
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={handleCreateGroup}
                                className="w-full py-5 bg-primary text-primary-foreground rounded-[24px] font-black shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4"
                            >
                                CREATE GROUP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
