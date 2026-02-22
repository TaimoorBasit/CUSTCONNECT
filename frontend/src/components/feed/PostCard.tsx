'use client';

import { useState, useEffect, useRef } from 'react';
import {
    HandThumbUpIcon,
    ChatBubbleOvalLeftIcon,
    PaperAirplaneIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    FlagIcon,
    TrashIcon,
    PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { postService } from '@/services/postService';
import { userService } from '@/services/userService';
import { Post } from '@/types';

interface PostCardProps {
    post: Post;
    onLike: () => void;
    currentUserId?: string;
    onMessage: (userId: string) => void;
    onFollowChange: () => void;
    onDelete?: (postId: string) => void;
}

export default function PostCard({ post, onLike, currentUserId, onMessage, onFollowChange, onDelete }: PostCardProps) {
    const router = useRouter();
    const [followLoading, setFollowLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [reporting, setReporting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isMe = post.author.id === currentUserId;

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showMenu]);

    const handleFollowToggle = async () => {
        setFollowLoading(true);
        try {
            if (post.isFollowing) {
                await userService.unfollowUser(post.author.id);
                toast.success(`Unfollowed ${post.author.firstName}`);
            } else {
                await userService.followUser(post.author.id);
                toast.success(`Now following ${post.author.firstName}`);
            }
            onFollowChange();
        } catch (err: any) {
            toast.error(err.message || 'Action failed');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleReport = async () => {
        setShowMenu(false);
        setReporting(true);
        try {
            await postService.reportPost(post.id, 'INAPPROPRIATE');
            toast.success('Post reported. Our team will review it.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to report');
        } finally {
            setReporting(false);
        }
    };

    const handleDelete = async () => {
        setShowMenu(false);
        if (!confirm('Delete this post?')) return;
        setDeleting(true);
        try {
            await postService.deletePost(post.id);
            toast.success('Post deleted');
            onDelete?.(post.id);
        } catch {
            toast.error('Failed to delete post');
            setDeleting(false);
        }
    };

    const getImageUrl = (filePath: string) => {
        if (!filePath) return '';
        if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
        const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
        return `${base}${filePath.startsWith('/') ? '' : '/'}${filePath}`;
    };

    if (deleting) return null;

    return (
        <div className="bg-card border-y md:border md:rounded-[24px] border-border/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href={`/dashboard/profile?id=${post.author.id}`} className="relative group">
                        <div className={`w-10 h-10 rounded-full p-[2px] transition-all duration-300 ${post.isFollowing ? 'bg-gradient-to-tr from-primary/20 to-primary/10' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
                            <div className="w-full h-full rounded-full bg-background p-0.5">
                                <div className="w-full h-full rounded-full bg-secondary/30 flex items-center justify-center font-black text-primary overflow-hidden">
                                    {post.author.profileImage
                                        ? <img src={post.author.profileImage} className="w-full h-full object-cover" alt="" />
                                        : post.author.firstName[0]}
                                </div>
                            </div>
                        </div>
                    </Link>
                    <div className="flex flex-col">
                        <Link href={`/dashboard/profile?id=${post.author.id}`} className="font-black text-sm hover:text-primary transition-colors leading-none tracking-tight">
                            {post.author.firstName} {post.author.lastName}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-widest">
                            {post.author.university?.name || 'STUDENT'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!isMe && !post.isFollowing && (
                        <button
                            onClick={handleFollowToggle}
                            disabled={followLoading}
                            className="text-[13px] font-black text-primary px-3 py-1.5 hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {followLoading ? '...' : 'Follow'}
                        </button>
                    )}

                    {/* 3-dots dropdown */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl transition-all"
                        >
                            <EllipsisHorizontalIcon className="w-6 h-6" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-10 w-52 bg-background border border-border/20 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                {!isMe && (
                                    <>
                                        <button
                                            onClick={handleReport}
                                            disabled={reporting}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                                        >
                                            <FlagIcon className="w-4 h-4 flex-shrink-0" />
                                            {reporting ? 'Reporting...' : 'Report Post'}
                                        </button>
                                        <button
                                            onClick={() => { setShowMenu(false); onMessage(post.author.id); }}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-secondary/50 transition-colors text-left"
                                        >
                                            <PaperAirplaneIcon className="w-4 h-4 -rotate-45 flex-shrink-0" />
                                            Send Message
                                        </button>
                                    </>
                                )}
                                {isMe && (
                                    <>
                                        <button
                                            onClick={() => { setShowMenu(false); router.push(`/dashboard/feed/edit/${post.id}`); }}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-secondary/50 transition-colors text-left"
                                        >
                                            <PencilSquareIcon className="w-4 h-4 flex-shrink-0" />
                                            Edit Post
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                                        >
                                            <TrashIcon className="w-4 h-4 flex-shrink-0" />
                                            Delete Post
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => { navigator.clipboard.writeText(window.location.origin + '/dashboard/feed?post=' + post.id); setShowMenu(false); toast.success('Link copied!'); }}
                                    className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-foreground hover:bg-secondary/50 transition-colors text-left border-t border-border/10"
                                >
                                    <ShareIcon className="w-4 h-4 flex-shrink-0" />
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Media */}
            {(post.imageUrl || post.videoUrl) && !imageError && (
                <div className="aspect-square bg-secondary/10 flex items-center justify-center overflow-hidden">
                    {post.videoUrl || (post.imageUrl && (post.imageUrl.toLowerCase().endsWith('.mp4') || post.imageUrl.toLowerCase().endsWith('.mov'))) ? (
                        <video
                            src={getImageUrl((post.videoUrl || post.imageUrl) as string)}
                            className="w-full h-full object-cover"
                            controls
                            onError={() => setImageError(true)}
                        />
                    ) : post.imageUrl ? (
                        <img
                            src={getImageUrl(post.imageUrl)}
                            className="w-full h-full object-cover"
                            alt="Post content"
                            onError={() => setImageError(true)}
                        />
                    ) : null}
                </div>
            )}

            {/* Actions */}
            <div className="p-4 border-t border-border/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                        <button onClick={onLike} className="transition-transform active:scale-125">
                            {post.isLiked
                                ? <HandThumbUpSolid className="w-7 h-7 text-primary animate-in zoom-in-50" />
                                : <HandThumbUpIcon className="w-7 h-7 text-foreground hover:text-muted-foreground transition-colors" />}
                        </button>
                        <button className="transition-transform active:scale-125">
                            <ChatBubbleOvalLeftIcon className="w-7 h-7 text-foreground hover:text-muted-foreground" />
                        </button>
                        {!isMe && (
                            <button onClick={() => onMessage(post.author.id)} className="transition-transform active:scale-125">
                                <PaperAirplaneIcon className="w-7 h-7 text-foreground -rotate-45 hover:text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(post.id); toast.success('Copied!'); }}>
                        <ShareIcon className="w-7 h-7 text-foreground hover:text-muted-foreground" />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                            <div className="w-4 h-4 rounded-full bg-primary/20 border border-background" />
                            <div className="w-4 h-4 rounded-full bg-primary/40 border border-background" />
                        </div>
                        <span className="text-[13px] font-black">{post.likes.toLocaleString()} likes</span>
                    </div>

                    {post.content && (
                        <div className="text-[14px] mt-1">
                            <Link href={`/dashboard/profile?id=${post.author.id}`} className="font-black mr-1.5 hover:text-primary transition-colors">
                                {post.author.firstName}
                            </Link>
                            <span className="text-foreground/80 font-medium leading-relaxed">{post.content}</span>
                        </div>
                    )}

                    {post.comments > 0 && (
                        <button className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors mt-1 block">
                            View all {post.comments} comments
                        </button>
                    )}

                    <span className="text-[11px] text-muted-foreground/50 font-medium mt-1.5 block">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </div>
    );
}
