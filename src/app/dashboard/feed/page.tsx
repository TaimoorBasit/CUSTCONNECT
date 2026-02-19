'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { postService } from '@/services/postService';
import { Post } from '@/types';
import {
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HandThumbUpIcon,
  XMarkIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const trendingTopics = ['AI Hackathon', 'Midterm Prep', 'Campus Marathon', 'Internship Tips'];

export default function SocialFeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postContent, setPostContent] = useState('');
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string>('');
  const [postVideoFile, setPostVideoFile] = useState<File | null>(null);
  const [postPrivacy, setPostPrivacy] = useState<'PUBLIC' | 'UNIVERSITY_ONLY' | 'FOLLOWERS_ONLY'>('PUBLIC');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const isSuperAdmin = user?.roles?.some(r => r.name === 'SUPER_ADMIN') || false;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getPosts({ page: 1, limit: 20 });
      const fetchedPosts = data?.posts || [];
      console.log('Fetched posts:', fetchedPosts.length);
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      toast.error(error.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPostImageFile(file);
        setPostVideoFile(null);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPostImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        setPostVideoFile(file);
        setPostImageFile(null);
        setPostImagePreview('');
      } else {
        toast.error('Please select an image or video file');
      }
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() && !postImageFile && !postVideoFile) {
      toast.error('Please enter some content or add an image/video');
      return;
    }

    try {
      setCreating(true);
      let imageUrl = '';
      let videoUrl = '';

      if (postImageFile) {
        if (postImageFile.size > 10 * 1024 * 1024) {
          toast.error('Image size must be less than 10MB');
          setCreating(false);
          return;
        }
        imageUrl = await uploadFile(postImageFile);
      }
      if (postVideoFile) {
        if (postVideoFile.size > 50 * 1024 * 1024) {
          toast.error('Video size must be less than 50MB');
          setCreating(false);
          return;
        }
        videoUrl = await uploadFile(postVideoFile);
      }

      const postData: any = { privacy: postPrivacy };
      if (postContent.trim()) postData.content = postContent.trim();
      if (imageUrl) postData.imageUrl = imageUrl;
      if (videoUrl) postData.videoUrl = videoUrl;

      await postService.createPost(postData);
      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setPostContent('');
      setPostImageFile(null);
      setPostVideoFile(null);
      setPostImagePreview('');
      setTimeout(() => {
        fetchPosts();
      }, 500);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postService.likePost(postId);
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to like post:', error);
      toast.error(error.message || 'Failed to like post');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const shareUrl = `${window.location.origin}/dashboard/feed?post=${postId}`;
        if (navigator.share) {
          await navigator.share({
            title: `Post by ${post.author.firstName} ${post.author.lastName}`,
            text: post.content || 'Check out this post',
            url: shareUrl
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to share:', error);
      }
    }
  };

  const handleCommentClick = async (postId: string) => {
    if (!showComments[postId]) {
      try {
        const data = await postService.getComments(postId);
        setComments({ ...comments, [postId]: data.comments });
        setShowComments({ ...showComments, [postId]: true });
        setSelectedPost(postId);
      } catch (error: any) {
        console.error('Failed to fetch comments:', error);
        toast.error(error.message || 'Failed to load comments');
      }
    } else {
      setShowComments({ ...showComments, [postId]: false });
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await postService.addComment(postId, commentContent);
      toast.success('Comment added!');
      setCommentContent('');
      const data = await postService.getComments(postId);
      setComments({ ...comments, [postId]: data.comments });
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to add comment:', error);
      toast.error(error.message || 'Failed to add comment');
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostContent(post.content || '');
    setPostImageFile(null);
    setPostVideoFile(null);
    setPostImagePreview(post.imageUrl || '');
    setPostPrivacy(post.privacy);
    setShowEditModal(true);
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    if (!postContent.trim() && !postImageFile && !postVideoFile && !postImagePreview) {
      toast.error('Please enter some content or add an image/video');
      return;
    }

    try {
      setUpdating(true);
      let imageUrl = editingPost.imageUrl || '';
      let videoUrl = editingPost.videoUrl || '';

      if (postImageFile) {
        if (postImageFile.size > 10 * 1024 * 1024) {
          toast.error('Image size must be less than 10MB');
          setUpdating(false);
          return;
        }
        imageUrl = await uploadFile(postImageFile);
      }
      if (postVideoFile) {
        if (postVideoFile.size > 50 * 1024 * 1024) {
          toast.error('Video size must be less than 50MB');
          setUpdating(false);
          return;
        }
        videoUrl = await uploadFile(postVideoFile);
      }

      const postData: any = { privacy: postPrivacy };
      if (postContent.trim()) postData.content = postContent.trim();
      if (imageUrl) postData.imageUrl = imageUrl;
      if (videoUrl) postData.videoUrl = videoUrl;

      await postService.updatePost(editingPost.id, postData);
      toast.success('Post updated successfully!');
      setShowEditModal(false);
      setEditingPost(null);
      setPostContent('');
      setPostImageFile(null);
      setPostVideoFile(null);
      setPostImagePreview('');
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to update post:', error);
      toast.error(error.message || 'Failed to update post');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await postService.deletePost(postId);
      toast.success('Post deleted successfully!');
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  };

  const handleUpdateComment = async (commentId: string, postId: string) => {
    if (!editCommentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    try {
      await postService.updateComment(commentId, editCommentContent);
      toast.success('Comment updated!');
      setEditingCommentId(null);
      setEditCommentContent('');
      const data = await postService.getComments(postId);
      setComments({ ...comments, [postId]: data.comments });
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      toast.error(error.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await postService.deleteComment(commentId);
      toast.success('Comment deleted!');
      const data = await postService.getComments(postId);
      setComments({ ...comments, [postId]: data.comments });
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleReportPost = (postId: string) => {
    setReportingPostId(postId);
    setReportReason('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportingPostId) return;
    try {
      setReporting(true);
      await postService.reportPost(reportingPostId, reportReason || undefined);
      toast.success('Post reported successfully. Admin will review it shortly.');
      setShowReportModal(false);
      setReportingPostId(null);
      setReportReason('');
    } catch (error: any) {
      console.error('Failed to report post:', error);
      toast.error(error.message || 'Failed to report post');
    } finally {
      setReporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Social Feed</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Discover what students across campus are sharing right now.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-200"
        >
          <UserGroupIcon className="mr-2 h-5 w-5" /> Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)} />
            <div className="relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-2xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Create Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Image/Video (optional)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {postImagePreview && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border">
                      <img
                        src={postImagePreview}
                        alt="Preview"
                        className="w-full h-auto max-h-60 object-cover"
                      />
                    </div>
                  )}
                  {postVideoFile && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-border">
                      <video
                        src={URL.createObjectURL(postVideoFile)}
                        controls
                        className="w-full h-auto max-h-60 object-cover"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Privacy</label>
                  <select
                    value={postPrivacy}
                    onChange={(e) => setPostPrivacy(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="UNIVERSITY_ONLY">University Only</option>
                    <option value="FOLLOWERS_ONLY">Followers Only</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleCreatePost}
                    disabled={creating}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 hover:scale-[1.02]"
                  >
                    {creating ? 'Creating...' : 'Create Post'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setPostContent('');
                      setPostImageFile(null);
                      setPostVideoFile(null);
                      setPostImagePreview('');
                    }}
                    className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all hover:scale-[1.02]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal - Same style as Create */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setShowEditModal(false)} />
            <div className="relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-2xl border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Edit Post</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  />
                </div>
                {/* Image/Video Inputs (Simplified for brevity, same as Create) */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Image/Video</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Privacy</label>
                  <select
                    value={postPrivacy}
                    onChange={(e) => setPostPrivacy(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="UNIVERSITY_ONLY">University Only</option>
                    <option value="FOLLOWERS_ONLY">Followers Only</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={handleUpdatePost}
                    disabled={updating}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Post'}
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-secondary rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-secondary rounded"></div>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
          <p className="text-muted-foreground text-lg">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border border-border">
                      {post.author.firstName[0]}{post.author.lastName[0]}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {post.author.university?.name || 'Unknown University'} • {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground border border-border">
                      {post.privacy}
                    </span>
                    {(post.canEdit || post.canDelete) && (
                      <div className="flex items-center gap-1 pl-2 border-l border-border ml-2">
                        {post.canEdit && (
                          <button
                            onClick={() => handleEditPost(post)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {post.canDelete && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {post.content && (
                  <p className="text-foreground leading-relaxed text-[15px]">{post.content}</p>
                )}
                {post.imageUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border/50 bg-secondary/30">
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="w-full object-cover"
                      style={{ maxHeight: '500px', minHeight: '200px' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
                {post.videoUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-border/50">
                    <video
                      src={post.videoUrl}
                      controls
                      className="w-full max-h-[500px] bg-black"
                    />
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${post.isLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                    >
                      <HandThumbUpIcon className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </button>
                    <button
                      onClick={() => handleCommentClick(post.id)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      {post.comments}
                    </button>
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ShareIcon className="h-5 w-5" />
                      Share
                    </button>
                  </div>
                  <button
                    onClick={() => handleReportPost(post.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Report"
                  >
                    <FlagIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-4 mb-4">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {comment.author.firstName[0]}{comment.author.lastName[0]}
                          </div>
                          <div className="flex-1">
                            <div className="bg-secondary/50 rounded-2xl px-4 py-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-foreground">
                                  {comment.author.firstName} {comment.author.lastName}
                                </p>
                                <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                              </div>
                              {editingCommentId === comment.id ? (
                                <div className="mt-2 flex gap-2">
                                  <input
                                    value={editCommentContent}
                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                    className="flex-1 px-3 py-1 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary"
                                    autoFocus
                                  />
                                  <button onClick={() => handleUpdateComment(comment.id, post.id)} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-lg">Save</button>
                                </div>
                              ) : (
                                <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                              )}
                            </div>
                            <div className="flex gap-4 mt-1 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(comment.canEdit || comment.canDelete) && (
                                <>
                                  {comment.canEdit && <button onClick={() => handleEditComment(comment)} className="text-xs text-muted-foreground hover:text-primary">Edit</button>}
                                  {comment.canDelete && <button onClick={() => handleDeleteComment(comment.id, post.id)} className="text-xs text-muted-foreground hover:text-destructive">Delete</button>}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        Me
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full pl-4 pr-12 py-2.5 rounded-full border border-border bg-secondary/30 text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="absolute right-1 top-1 p-1.5 bg-primary text-primary-foreground rounded-full hover:scale-105 transition-transform"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-foreground mb-4">Trending Topics</h3>
              <ul className="space-y-3">
                {trendingTopics.map((topic, idx) => (
                  <li key={topic} className="flex items-center gap-3 p-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer group">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{idx + 1}</span>
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* Report Modal - Same styling */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={() => setShowReportModal(false)} />
            <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-destructive">Report Post</h2>
                <button onClick={() => setShowReportModal(false)} className="text-muted-foreground hover:text-foreground"><XMarkIcon className="h-6 w-6" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Help us keep the community safe.</p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Reason for reporting..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border-transparent text-foreground focus:ring-2 focus:ring-destructive/50 resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={handleSubmitReport} disabled={reporting} className="flex-1 rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">{reporting ? 'Reporting...' : 'Report'}</button>
                  <button onClick={() => setShowReportModal(false)} className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
