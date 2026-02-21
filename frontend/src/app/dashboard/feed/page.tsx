'use client';

import { useState, useEffect, useRef } from 'react';
import { postService } from '@/services/postService';
import { userService } from '@/services/userService';
import { Post } from '@/types';
import {
  ChatBubbleOvalLeftIcon,
  HandThumbUpIcon,
  ShareIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  UserPlusIcon,
  UserMinusIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { storyService, StoryFeedItem, Story } from '@/services/storyService';
import { CameraIcon } from '@heroicons/react/24/solid';

export default function SocialFeedPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FOR_YOU' | 'FOLLOWING'>('FOR_YOU');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'UNIVERSITY_ONLY' | 'FOLLOWERS_ONLY'>('PUBLIC');
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryFeedItem[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [selectedStoryAuthor, setSelectedStoryAuthor] = useState<StoryFeedItem | null>(null);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
    fetchStories();
  }, [activeTab]);

  useEffect(() => {
    if (!socket) return;

    const handleNewStory = () => {
      fetchStories();
    };

    socket.on('new-story', handleNewStory);
    return () => {
      socket.off('new-story', handleNewStory);
    };
  }, [socket]);

  const fetchStories = async () => {
    try {
      setLoadingStories(true);
      const data = await storyService.getFeed();
      setStories(data);
    } catch (error) {
      console.error('Failed to load stories');
    } finally {
      setLoadingStories(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts({
        page: 1,
        limit: 20,
        followingOnly: activeTab === 'FOLLOWING'
      });
      setPosts(data?.posts || []);
    } catch (error: any) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLike = async (postId: string) => {
    const originalPosts = [...posts];
    setPosts(posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
    try {
      await postService.likePost(postId);
    } catch (error) {
      setPosts(originalPosts);
      toast.error('Connection error');
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !selectedFile) return;
    try {
      setCreating(true);

      let imageUrl = '';
      let videoUrl = '';

      if (selectedFile) {
        const fileUrl = await postService.uploadPostFile(selectedFile);
        if (selectedFile.type.startsWith('video/')) {
          videoUrl = fileUrl;
        } else {
          imageUrl = fileUrl;
        }
      }

      await postService.createPost({
        content: postContent,
        privacy,
        imageUrl,
        videoUrl
      });

      toast.success('Shared with campus');
      setShowCreateModal(false);
      setPostContent('');
      setPrivacy('PUBLIC');
      setSelectedFile(null);
      setFilePreview(null);
      fetchPosts();
    } catch (error: any) {
      toast.error('Failed to post');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-background/50 animate-in fade-in duration-700">
      {/* Dynamic Tab Navigation */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/10">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('FOR_YOU')}
            className={`flex-1 py-4 text-[13px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'FOR_YOU' ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
          >
            For You
            {activeTab === 'FOR_YOU' && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-primary rounded-full animate-in slide-in-from-bottom-2" />}
          </button>
          <button
            onClick={() => setActiveTab('FOLLOWING')}
            className={`flex-1 py-4 text-[13px] font-black uppercase tracking-widest transition-all relative ${activeTab === 'FOLLOWING' ? 'text-primary' : 'text-muted-foreground/40 hover:text-muted-foreground'}`}
          >
            Following
            {activeTab === 'FOLLOWING' && <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-primary rounded-full animate-in slide-in-from-bottom-2" />}
          </button>
        </div>
      </div>

      {/* Stories Section */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-4">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1">
          {/* Create Story Button */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowStoryCreator(true)}
              className="w-16 h-16 rounded-[22px] bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
            >
              <PlusIcon className="w-8 h-8" />
            </button>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Post</span>
          </div>

          {loadingStories ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                <div className="w-16 h-16 rounded-[22px] bg-secondary" />
                <div className="w-10 h-2 bg-secondary rounded-full" />
              </div>
            ))
          ) : stories.map((item) => (
            <div key={item.author.id} className="flex flex-col items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedStoryAuthor(item)}
                className="w-16 h-16 rounded-[22px] p-0.5 border-2 border-primary bg-background shadow-md active:scale-95 transition-all overflow-hidden"
              >
                <div className="w-full h-full rounded-[18px] bg-secondary/30 flex items-center justify-center font-black text-primary overflow-hidden">
                  {item.author.profileImage ? (
                    <img src={item.author.profileImage} className="w-full h-full object-cover" alt="" />
                  ) : item.author.firstName[0]}
                </div>
              </button>
              <span className="text-[10px] font-black uppercase text-foreground/60 tracking-tighter truncate w-16 text-center">
                {item.author.firstName}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-6 max-w-2xl mx-auto w-full">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card/40 border border-border/10 rounded-[32px] p-6 space-y-4 animate-pulse">
              <div className="flex gap-4"><div className="w-12 h-12 bg-secondary rounded-2xl" /><div className="space-y-3 py-2 flex-1"><div className="w-24 h-2.5 bg-secondary rounded-full" /><div className="w-32 h-2 bg-secondary rounded-full" /></div></div>
              <div className="space-y-2"><div className="w-full h-2.5 bg-secondary rounded-full" /><div className="w-3/4 h-2.5 bg-secondary rounded-full" /></div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 bg-secondary/30 rounded-[30px] flex items-center justify-center mx-auto mb-6">
              <PlusIcon className="w-10 h-10 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Feed is quiet...</h3>
            <p className="text-muted-foreground font-medium mb-8">Start following your friends or cafes to see what's happening!</p>
            {activeTab === 'FOLLOWING' && (
              <button
                onClick={() => setActiveTab('FOR_YOU')}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-[20px] font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Explore Campus
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={() => handleLike(post.id)}
              currentUserId={user?.id}
              onMessage={(userId) => router.push(`/dashboard/messages?userId=${userId}`)}
              onFollowChange={fetchPosts}
            />
          ))
        )}
      </div>

      {/* Modern App FAB */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-primary text-primary-foreground rounded-[24px] shadow-2xl shadow-primary/40 flex items-center justify-center transform active:scale-90 transition-all z-40 hover:rotate-3 border-4 border-background"
      >
        <PlusIcon className="w-8 h-8 stroke-[3]" />
      </button>

      {/* Swipeable Sheet Style Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[13px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Content</label>
                <textarea
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:ring-0 rounded-[20px] p-5 text-[16px] font-medium text-gray-700 placeholder-gray-300 resize-none min-h-[140px] transition-all"
                  placeholder="What's on your mind?"
                  autoFocus
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[13px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Image/Video (optional)</label>
                <div className="bg-gray-50 rounded-[20px] p-2 flex items-center gap-4 border-2 border-transparent">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-[15px] text-sm font-black shadow-lg shadow-primary/20 active:scale-95 transition-all whitespace-nowrap"
                  >
                    Choose File
                  </button>
                  <span className="text-sm font-bold text-gray-400 truncate flex-1 px-1">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </span>
                  {selectedFile && (
                    <button onClick={removeSelectedFile} title="Remove file" className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-[13px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Privacy</label>
                <div className="relative">
                  <select
                    value={privacy}
                    onChange={(e) => setPrivacy(e.target.value as any)}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:ring-0 rounded-[20px] p-5 text-[16px] font-bold text-gray-700 appearance-none transition-all cursor-pointer"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="UNIVERSITY_ONLY">University Only</option>
                    <option value="FOLLOWERS_ONLY">Followers Only</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                    <EllipsisHorizontalIcon className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={handleCreatePost}
                disabled={creating || (!postContent.trim() && !selectedFile)}
                className="flex-[2] bg-primary text-primary-foreground py-5 rounded-[22px] font-black shadow-xl shadow-primary/25 disabled:opacity-30 active:scale-95 transition-all"
              >
                {creating ? 'Creating...' : 'Create Post'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border-2 border-gray-100 py-5 rounded-[22px] font-black text-gray-400 active:scale-95 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Story Creator Modal */}
      {showStoryCreator && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowStoryCreator(false)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <XMarkIcon className="w-6 h-6 text-gray-500" />
            </button>

            <h2 className="text-3xl font-black text-gray-900 mb-2">New Story</h2>
            <p className="text-gray-500 font-medium mb-8">Share a moment that lasts for 24 hours.</p>

            <div className="space-y-6">
              <div
                onClick={() => storyInputRef.current?.click()}
                className="w-full h-64 bg-gray-50 rounded-[32px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100/50 transition-all group overflow-hidden"
              >
                {filePreview ? (
                  <img src={filePreview} className="w-full h-full object-cover" alt="" />
                ) : (
                  <>
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CameraIcon className="w-10 h-10 text-primary" />
                    </div>
                    <span className="font-black text-gray-400 uppercase tracking-widest text-xs">Choose Photo</span>
                  </>
                )}
              </div>
              <input type="file" ref={storyInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

              <button
                disabled={creating || !selectedFile}
                onClick={async () => {
                  if (!selectedFile) return;
                  try {
                    setCreating(true);
                    const formData = new FormData();
                    formData.append('file', selectedFile);
                    await storyService.createStory(formData);
                    toast.success('Story posted!');
                    setShowStoryCreator(false);
                    removeSelectedFile();
                    fetchStories();
                  } catch (error) {
                    toast.error('Failed to post story');
                  } finally {
                    setCreating(false);
                  }
                }}
                className="w-full py-5 bg-primary text-primary-foreground rounded-[24px] font-black shadow-xl shadow-primary/25 disabled:opacity-30 active:scale-95 transition-all"
              >
                {creating ? 'Posting...' : 'Share Story'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Component */}
      {selectedStoryAuthor && (
        <StoryViewer
          item={selectedStoryAuthor}
          onClose={() => setSelectedStoryAuthor(null)}
          onView={(id) => storyService.viewStory(id)}
        />
      )}
    </div>
  );
}

function StoryViewer({ item, onClose, onView }: { item: StoryFeedItem, onClose: () => void, onView: (id: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const story = item.stories[currentIndex];

  useEffect(() => {
    setProgress(0);
    onView(story.id);
    const duration = 5000; // 5 seconds per story
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < item.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const getImageUrl = (path: string) => path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${path}`;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex gap-1">
        {item.stories.map((s, idx) => (
          <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{ width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      <div className="absolute top-8 left-0 right-0 p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white/20">
            {item.author.profileImage ? (
              <img src={item.author.profileImage} className="w-full h-full object-cover" alt="" />
            ) : <div className="w-full h-full flex items-center justify-center font-black text-white">{item.author.firstName[0]}</div>}
          </div>
          <span className="text-white font-black text-sm uppercase tracking-widest">{item.author.firstName}</span>
        </div>
        <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-all">
          <XMarkIcon className="w-8 h-8" />
        </button>
      </div>

      <div className="w-full h-full max-w-md relative overflow-hidden flex items-center justify-center">
        <img src={getImageUrl(story.mediaUrl)} className="w-full h-full object-contain" alt="" />

        {/* Navigation Overlays */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} />
          <div className="w-2/3 h-full cursor-pointer" onClick={() => {
            if (currentIndex < item.stories.length - 1) setCurrentIndex(currentIndex + 1);
            else onClose();
          }} />
        </div>
      </div>
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
  currentUserId?: string;
  onMessage: (userId: string) => void;
  onFollowChange: () => void;
}

function PostCard({ post, onLike, currentUserId, onMessage, onFollowChange }: PostCardProps) {
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Note: Backend doesn't explicitly return isFollowing in post, 
  // we would need to check this. For a better UX, an 'isFollowing' flag in post would be ideal.
  // In the interest of immediate functionality, we'll assume Not Following for now 
  // OR we can check user's following list.

  const isMe = post.author.id === currentUserId;

  const handleFollowToggle = async () => {
    try {
      setFollowLoading(true);
      if (post.isFollowing) {
        await userService.unfollowUser(post.author.id);
        toast.success(`Unfollowed ${post.author.firstName}`);
      } else {
        await userService.followUser(post.author.id);
        toast.success(`Following ${post.author.firstName}`);
      }
      onFollowChange();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const getImageUrl = (path: string) => path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${path}`;

  return (
    <div className="bg-card border border-border/40 rounded-[32px] overflow-hidden transition-all active:scale-[0.99] shadow-sm hover:shadow-md">
      <div className="p-6 flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex-shrink-0 flex items-center justify-center font-black text-primary border border-primary/10 text-lg shadow-sm">
          {post.author.firstName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h4 className="font-black text-[16px] text-foreground tracking-tight leading-tight">{post.author.firstName} {post.author.lastName}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[11px] text-primary/70 font-black uppercase tracking-widest">
                  {post.author.university?.name || 'STUDENT'}
                </span>
                <span className="text-muted-foreground/30">•</span>
                <span className="text-[11px] text-muted-foreground font-bold tracking-tight">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {!isMe && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`p-2.5 rounded-xl transition-all active:scale-90 ${post.isFollowing ? 'bg-secondary text-foreground hover:bg-red-50 hover:text-red-500' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                  title={post.isFollowing ? 'Unfollow' : 'Follow'}
                >
                  {post.isFollowing ? (
                    <UserMinusIcon className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <UserPlusIcon className="w-5 h-5 stroke-[2.5]" />
                  )}
                </button>
                <button
                  onClick={() => onMessage(post.author.id)}
                  className="p-2.5 rounded-xl bg-secondary/80 text-foreground hover:bg-secondary transition-all active:scale-90"
                  title="Direct Message"
                >
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45 relative translate-x-0.5" />
                </button>
              </div>
            )}
          </div>

          <p className="mt-4 text-[16px] leading-[1.6] text-foreground/80 font-medium tracking-tight whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {(post.imageUrl || post.videoUrl) && (
        <div className="px-6 pb-2">
          {post.videoUrl || (post.imageUrl && (post.imageUrl.toLowerCase().endsWith('.mp4') || post.imageUrl.toLowerCase().endsWith('.mov'))) ? (
            <video
              src={getImageUrl(post.videoUrl || post.imageUrl!)}
              className="w-full h-[300px] rounded-[24px] object-cover border border-border/10 shadow-inner"
              controls
            />
          ) : post.imageUrl ? (
            <img
              src={getImageUrl(post.imageUrl)}
              className="w-full h-[300px] rounded-[24px] object-cover border border-border/10 shadow-inner"
              alt="Post content"
            />
          ) : null}
        </div>
      )}

      <div className="px-8 py-5 flex items-center justify-between bg-secondary/5 border-t border-border/10">
        <div className="flex items-center gap-8">
          <button onClick={onLike} className="flex items-center gap-2.5 group scale-110">
            {post.isLiked ? (
              <HandThumbUpSolid className="w-6 h-6 text-primary animate-in zoom-in-50" />
            ) : (
              <HandThumbUpIcon className="w-6 h-6 text-muted-foreground/40 transition-colors group-hover:text-primary" />
            )}
            <span className={`text-[14px] font-black ${post.isLiked ? 'text-primary' : 'text-muted-foreground/40'}`}>{post.likes}</span>
          </button>

          <button className="flex items-center gap-2.5 group scale-110">
            <ChatBubbleOvalLeftIcon className="w-6 h-6 text-muted-foreground/40 transition-colors group-hover:text-primary" />
            <span className="text-[14px] font-black text-muted-foreground/40">{post.comments}</span>
          </button>
        </div>

        <button className="p-2.5 rounded-2xl bg-secondary/30 text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all">
          <ShareIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
