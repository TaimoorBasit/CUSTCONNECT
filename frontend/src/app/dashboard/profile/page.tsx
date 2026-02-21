'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService';
import { User, Post } from '@/types';
import {
    ArrowLeftIcon,
    MapPinIcon,
    AcademicCapIcon,
    ChatBubbleBottomCenterTextIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
    post: Post;
    onLike: () => void;
    currentUserId?: string;
}

function ProfilePostCard({ post, onLike, currentUserId }: PostCardProps) {
    const getImageUrl = (path: string) => path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${path}`;

    return (
        <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em]">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-gray-700 font-medium leading-relaxed mb-4">{post.content}</p>
                {(post.imageUrl || post.videoUrl) && (
                    <div className="rounded-[24px] overflow-hidden border border-gray-100 mb-4">
                        {post.imageUrl && (
                            <img src={getImageUrl(post.imageUrl)} className="w-full h-auto max-h-[400px] object-cover" alt="" />
                        )}
                    </div>
                )}
                <div className="flex items-center gap-6">
                    <button onClick={onLike} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${post.isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50'}`}>
                            <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black">{post.likes}</span>
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
        if (id) {
            fetchData();
        }
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
            <div className="max-w-4xl mx-auto p-8 animate-pulse text-primary">
                <div className="h-48 bg-gray-100 rounded-b-[40px] mb-8" />
                <div className="flex gap-8">
                    <div className="w-32 h-32 bg-gray-100 rounded-[32px] -mt-20 ml-8 border-8 border-white" />
                    <div className="flex-1 pt-4 space-y-4">
                        <div className="h-8 bg-gray-100 rounded-full w-48" />
                        <div className="h-4 bg-gray-100 rounded-full w-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return <div className="p-20 text-center font-black uppercase text-gray-400">User not found</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header / Cover */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-b-[60px] shadow-lg">
                <button
                    onClick={() => router.back()}
                    className="absolute top-8 left-8 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-[20px] flex items-center justify-center hover:bg-white/30 transition-all active:scale-90"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Profile Info */}
            <div className="px-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="relative -mt-20">
                    <div className="w-40 h-40 rounded-[48px] bg-white p-2 shadow-2xl">
                        <div className="w-full h-full rounded-[40px] bg-secondary/50 flex items-center justify-center overflow-hidden border-2 border-primary/5">
                            {user.profileImage ? (
                                <img src={user.profileImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <span className="text-5xl font-black text-primary/20">{user.firstName[0]}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tighter text-gray-900 leading-none">
                                {user.firstName} {user.lastName}
                            </h1>
                            <div className="flex items-center gap-3 text-gray-400 font-bold text-sm tracking-tight">
                                <span className="flex items-center gap-1"><AcademicCapIcon className="w-4 h-4" /> {user.university?.name}</span>
                                <span className="text-gray-200">|</span>
                                <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" /> {user.university?.city}</span>
                            </div>
                        </div>

                        {currentUser?.id !== user.id && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push(`/dashboard/messages?userId=${user.id}`)}
                                    className="px-6 py-4 bg-gray-100 text-gray-700 rounded-[22px] font-black text-sm hover:bg-gray-200 transition-all active:scale-90"
                                >
                                    Message
                                </button>
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className="px-8 py-4 bg-primary text-white rounded-[22px] font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-90 transition-all flex items-center gap-2"
                                >
                                    <UserPlusIcon className="w-5 h-5" />
                                    Follow
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-8 mt-8 border-y border-gray-100 py-6">
                        <div className="text-center">
                            <div className="text-xl font-black text-gray-900 leading-none">{user._count?.posts || 0}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Posts</div>
                        </div>
                        <div className="text-center border-x border-gray-100 px-8">
                            <div className="text-xl font-black text-gray-900 leading-none">{user._count?.followers || 0}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Followers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black text-gray-900 leading-none">{user._count?.following || 0}</div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Following</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="px-8 mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black tracking-tighter">Timeline<span className="text-primary italic">.</span></h2>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Latest Activity</span>
                </div>

                {posts.length === 0 ? (
                    <div className="bg-gray-50 rounded-[40px] py-32 text-center border-4 border-dashed border-gray-100">
                        <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="font-black text-gray-300 uppercase tracking-widest text-sm">No contributions yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="max-w-4xl mx-auto p-8 animate-pulse text-primary">
                <div className="h-48 bg-gray-100 rounded-b-[40px] mb-8" />
                <div className="flex gap-8">
                    <div className="w-32 h-32 bg-gray-100 rounded-[32px] -mt-20 ml-8 border-8 border-white" />
                </div>
            </div>
        }>
            <UserProfileContent />
        </Suspense>
    );
}
