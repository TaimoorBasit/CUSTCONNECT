'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { User } from '@/types';
import {
    UsersIcon,
    UserMinusIcon,
    ChatBubbleLeftRightIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { getImageUrl, getUiAvatarUrl } from '@/utils/url';
import PageHeader from '@/components/dashboard/PageHeader';

export default function ConnectionsPage() {
    const { user } = useAuth();
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'FOLLOWING' | 'FOLLOWERS'>('FOLLOWING');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) fetchData();
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
        <div className="min-h-screen bg-[#F8F7F4]">
            <PageHeader
                title="Social Hub"
                subtitle="Manage your campus connections and network"
                icon={UsersIcon}
                iconColor="#1a2744"
                iconBg="#F0F3FA"
            />

            <div className="max-w-4xl mx-auto px-4 md:px-8 pb-16 space-y-5">
                {/* Tab Switcher */}
                <div className="flex gap-2 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
                    {(['FOLLOWING', 'FOLLOWERS'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab
                                    ? 'bg-[#1a2744] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'FOLLOWING' ? `Following (${following.length})` : `Followers (${followers.length})`}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab.toLowerCase()}…`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-5 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/30 transition"
                    />
                </div>

                {/* List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="w-32 h-3 bg-gray-100 rounded-full" />
                                    <div className="w-24 h-2 bg-gray-100 rounded-full" />
                                </div>
                            </div>
                        ))
                    ) : filteredList.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-[#F0F3FA] rounded-2xl flex items-center justify-center">
                                <UsersIcon className="w-8 h-8 text-[#1a2744]/30" strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-gray-700">No connections yet</p>
                                <p className="text-sm text-gray-400 mt-1">Head to the Campus Feed to find people to connect with</p>
                            </div>
                            <Link
                                href="/dashboard/feed"
                                className="flex items-center gap-1.5 text-sm font-semibold text-[#A51C30] hover:text-[#8b1526] transition-colors"
                            >
                                Explore Feed <ArrowRightIcon className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        filteredList.map((u) => (
                            <div
                                key={u.id}
                                className="group bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-sm hover:border-gray-200"
                            >
                                <Link href={`/dashboard/profile?id=${u.id}`} className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-[#F0F3FA]">
                                    {u.profileImage ? (
                                        <img
                                            src={getImageUrl(u.profileImage) || ''}
                                            className="w-full h-full object-cover"
                                            alt=""
                                            onError={(e) => { (e.target as HTMLImageElement).src = getUiAvatarUrl(u.firstName, u.lastName); }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#1a2744]/40">
                                            {u.firstName[0]}
                                        </div>
                                    )}
                                </Link>

                                <div className="flex-1 min-w-0">
                                    <Link href={`/dashboard/profile?id=${u.id}`} className="text-sm font-bold text-gray-900 hover:text-[#1a2744] transition-colors block truncate">
                                        {u.firstName} {u.lastName}
                                    </Link>
                                    <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                                        {u.university?.name || 'Student'}
                                        {u.year ? ` · Year ${u.year}` : ''}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/dashboard/messages?userId=${u.id}`}
                                        className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 hover:bg-[#F0F3FA] hover:text-[#1a2744] flex items-center justify-center transition-colors"
                                        title="Message"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    </Link>
                                    {activeTab === 'FOLLOWING' && (
                                        <button
                                            onClick={() => handleUnfollow(u.id)}
                                            className="w-8 h-8 rounded-xl bg-[#FFF5F5] text-[#A51C30] hover:bg-[#A51C30] hover:text-white flex items-center justify-center transition-colors"
                                            title="Unfollow"
                                        >
                                            <UserMinusIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
