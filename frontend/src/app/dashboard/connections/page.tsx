'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { User } from '@/types';
import {
    UsersIcon,
    UserPlusIcon,
    UserMinusIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ConnectionsPage() {
    const { user } = useAuth();
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'FOLLOWING' | 'FOLLOWERS'>('FOLLOWING');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [followersData, followingData] = await Promise.all([
                userService.getFollowers(user!.id),
                userService.getFollowing(user!.id)
            ]);
            setFollowers(followersData.followers);
            setFollowing(followingData.following);
        } catch (error) {
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (userId: string) => {
        try {
            await userService.unfollowUser(userId);
            toast.success('Unfollowed');
            fetchData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const filteredList = (activeTab === 'FOLLOWING' ? following : followers).filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <UsersIcon className="w-10 h-10 text-primary" />
                        Social Hub
                    </h1>
                    <p className="text-muted-foreground font-medium mt-2 text-lg">Manage your campus connections and network.</p>
                </div>

                <div className="flex bg-secondary/30 p-1.5 rounded-[24px] border border-border/50">
                    <button
                        onClick={() => setActiveTab('FOLLOWING')}
                        className={`px-8 py-3 rounded-[18px] text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === 'FOLLOWING' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Following ({following.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('FOLLOWERS')}
                        className={`px-8 py-3 rounded-[18px] text-[13px] font-black uppercase tracking-widest transition-all ${activeTab === 'FOLLOWERS' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Followers ({followers.length})
                    </button>
                </div>
            </div>

            <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder={`Search ${activeTab.toLowerCase()}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-card border-border/40 focus:border-primary/20 focus:ring-0 rounded-[28px] pl-14 pr-8 py-5 text-lg font-medium shadow-sm transition-all placeholder:text-muted-foreground/40"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-card/40 border border-border/10 rounded-[32px] p-6 flex items-center gap-4 animate-pulse">
                            <div className="w-14 h-14 bg-secondary rounded-2xl" />
                            <div className="flex-1 space-y-2">
                                <div className="w-32 h-3 bg-secondary rounded-full" />
                                <div className="w-24 h-2 bg-secondary rounded-full" />
                            </div>
                        </div>
                    ))
                ) : filteredList.length === 0 ? (
                    <div className="col-span-full py-20 bg-card/40 border border-dashed border-border/40 rounded-[40px] text-center">
                        <div className="w-20 h-20 bg-secondary/30 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                            <UsersIcon className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-1">No connections yet</h3>
                        <p className="text-muted-foreground font-medium">Head over to the Campus Feed to find people to connect with!</p>
                        <Link href="/dashboard/feed" className="inline-flex items-center gap-2 text-primary font-black mt-6 hover:gap-3 transition-all uppercase text-xs tracking-widest">
                            Explore Feed <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    filteredList.map((u) => (
                        <div key={u.id} className="group bg-card border border-border/40 rounded-[32px] p-6 flex items-center gap-6 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10">
                            <Link href={`/dashboard/profile?id=${u.id}`} className="w-16 h-16 rounded-[24px] bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-2xl shadow-sm hover:scale-105 transition-transform">
                                {u.profileImage ? (
                                    <img src={u.profileImage} className="w-full h-full object-cover rounded-[24px]" alt="" />
                                ) : u.firstName[0]}
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link href={`/dashboard/profile?id=${u.id}`} className="font-black text-lg text-foreground truncate hover:text-primary transition-colors block">
                                    {u.firstName} {u.lastName}
                                </Link>
                                <p className="text-[11px] text-primary/70 font-black uppercase tracking-widest truncate">
                                    {u.university?.name || 'STUDENT'}
                                    {u.year ? ` • YEAR ${u.year}` : ''}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/dashboard/messages?userId=${u.id}`}
                                    className="p-3.5 rounded-2xl bg-secondary/80 text-foreground hover:bg-secondary transition-all active:scale-90 shadow-sm"
                                    title="Message"
                                >
                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                </Link>

                                {activeTab === 'FOLLOWING' && (
                                    <button
                                        onClick={() => handleUnfollow(u.id)}
                                        className="p-3.5 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 transition-all active:scale-90 shadow-sm"
                                        title="Unfollow"
                                    >
                                        <UserMinusIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
