'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { getImageUrl, getUiAvatarUrl } from '@/utils/url';
import { User, Post } from '@/types';
import {
    ArrowLeftIcon,
    MapPinIcon,
    AcademicCapIcon,
    ChatBubbleBottomCenterTextIcon,
    UserPlusIcon,
    HeartIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
    post: Post;
    onLike: () => void;
    currentUserId?: string;
}

function ProfilePostCard({ post, onLike }: PostCardProps) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {(post.imageUrl || post.videoUrl) && (
                <div className="h-44 bg-gray-100 overflow-hidden">
                    {post.imageUrl && (
                        <img
                            src={getImageUrl(post.imageUrl)}
                            className="w-full h-full object-cover"
                            alt=""
                        />
                    )}
                </div>
            )}
            <div className="p-4">
                <p className="text-gray-700 text-sm leading-relaxed mb-3">{post.content}</p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    <button
                        onClick={onLike}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${post.isLiked ? 'text-[#A51C30]' : 'text-gray-400 hover:text-[#A51C30]'
                            }`}
                    >
                        <HeartIcon className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        {post.likes}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UserProfileContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const [userData, postData] = await Promise.all([
                userService.getUserById(id),
                postService.getUserPosts(id)
            ]);
            setUser(userData);
            setPosts(postData.posts);
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) return;
        try {
            setFollowLoading(true);
            await userService.followUser(user.id);
            toast.success(`Following ${user.firstName}`);
            fetchData();
        } catch (error: any) {
            if (error.message?.includes('Already following')) {
                await userService.unfollowUser(user.id);
                toast.success(`Unfollowed ${user.firstName}`);
                fetchData();
            } else {
                toast.error('Action failed');
            }
        } finally {
            setFollowLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            await postService.likePost(postId);
            setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F7F4]">
                <div className="h-40 bg-[#1a2744] animate-pulse" />
                <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-12 animate-pulse">
                    <div className="flex gap-5 items-end">
                        <div className="w-24 h-24 rounded-2xl bg-gray-200 border-4 border-white flex-shrink-0" />
                        <div className="pb-2 space-y-2 flex-1">
                            <div className="h-6 bg-gray-200 rounded-full w-48" />
                            <div className="h-3 bg-gray-200 rounded-full w-32" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8F7F4]">
            <p className="text-gray-400 font-semibold">User not found</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            {/* Cover Banner */}
            <div className="relative h-40 bg-[#1a2744] overflow-hidden">
                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-[0.08]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 24px)`,
                    }}
                />
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#A51C30]" />
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 w-9 h-9 bg-white/10 backdrop-blur-sm text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Info */}
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-end -mt-12 mb-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex-shrink-0 overflow-hidden">
                        {user.profileImage ? (
                            <img
                                src={getImageUrl(user.profileImage) || ''}
                                className="w-full h-full object-cover"
                                alt=""
                                onError={(e) => { (e.target as HTMLImageElement).src = getUiAvatarUrl(user.firstName, user.lastName); }}
                            />
                        ) : (
                            <div className="w-full h-full bg-[#F0F3FA] flex items-center justify-center text-3xl font-bold text-[#1a2744]/30">
                                {user.firstName[0]}
                            </div>
                        )}
                    </div>

                    {/* Name + actions */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1a2744] leading-tight">
                                {user.firstName} {user.lastName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium mt-1.5">
                                {user.university?.name && (
                                    <span className="flex items-center gap-1">
                                        <AcademicCapIcon className="w-3.5 h-3.5" />
                                        {user.university.name}
                                    </span>
                                )}
                                {user.university?.city && (
                                    <span className="flex items-center gap-1">
                                        <MapPinIcon className="w-3.5 h-3.5" />
                                        {user.university.city}
                                    </span>
                                )}
                            </div>
                        </div>

                        {currentUser?.id !== user.id && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.push(`/dashboard/messages?userId=${user.id}`)}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    Message
                                </button>
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] disabled:opacity-50 transition-colors flex items-center gap-1.5"
                                >
                                    <UserPlusIcon className="w-4 h-4" />
                                    Follow
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { label: 'Posts', value: user._count?.posts || 0 },
                        { label: 'Followers', value: user._count?.followers || 0 },
                        { label: 'Following', value: user._count?.following || 0 },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                            <div className="text-2xl font-bold text-[#1a2744]">{value}</div>
                            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Posts */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-[#1a2744]">Timeline</h2>
                    <span className="text-xs text-gray-400 font-medium">Latest activity</span>
                </div>

                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-14 h-14 bg-[#F0F3FA] rounded-2xl flex items-center justify-center">
                            <ChatBubbleBottomCenterTextIcon className="w-7 h-7 text-[#1a2744]/20" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-semibold text-gray-400">No posts yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-16">
                        {posts.map(post => (
                            <ProfilePostCard
                                key={post.id}
                                post={post}
                                onLike={() => handleLike(post.id)}
                                currentUserId={currentUser?.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UserProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8F7F4]">
                <div className="h-40 bg-[#1a2744] animate-pulse" />
            </div>
        }>
            <UserProfileContent />
        </Suspense>
    );
}
