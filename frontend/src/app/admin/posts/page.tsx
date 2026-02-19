'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';
import { 
  TrashIcon, 
  ExclamationTriangleIcon,
  UserCircleIcon,
  PhotoIcon,
  VideoCameraIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  isActive?: boolean;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: {
      name: string;
    };
  };
  reports?: Array<{
    id: string;
    reason?: string;
    status: string;
    createdAt: string;
    reporter: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
    reports?: number;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch all posts (including inactive ones) for moderation
      const data = await adminService.getPosts({ 
        page: 1, 
        limit: 100, 
        showAll: true,
        reportedOnly: showReportedOnly
      });
      setPosts(data.posts || []);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [showReportedOnly]);

  const handleDelete = async () => {
    if (!selectedPost) return;
    try {
      await adminService.deletePost(selectedPost.id);
      toast.success('Post deleted successfully');
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      setShowDeleteModal(false);
      setSelectedPost(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete post');
    }
  };

  const handleSendWarning = async () => {
    if (!selectedPost || !warningMessage.trim()) {
      toast.error('Please enter a warning message');
      return;
    }
    try {
      await adminService.sendWarningToUser(selectedPost.author.id, warningMessage);
      toast.success('Warning sent to user successfully');
      setShowWarningModal(false);
      setSelectedPost(null);
      setWarningMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send warning');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(query) ||
      post.author.firstName.toLowerCase().includes(query) ||
      post.author.lastName.toLowerCase().includes(query) ||
      post.author.email.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Social Feed Moderation</h1>
          <p className="text-gray-500">Review and moderate student posts.</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by content, author name, or email..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowReportedOnly(!showReportedOnly)}
            className={`px-4 py-2 rounded-md border font-medium transition-colors ${
              showReportedOnly
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FlagIcon className="h-5 w-5 inline-block mr-2" />
            {showReportedOnly ? 'Show All Posts' : 'Show Reported Only'}
          </button>
        </div>
        {showReportedOnly && (
          <p className="text-sm text-gray-600">
            Showing posts that have been reported by users. Review and take action to keep the community safe.
          </p>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white shadow rounded-lg p-6">
              {/* Author Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {post.author.firstName} {post.author.lastName}
                      </h3>
                      {post.author.university && (
                        <span className="text-xs text-gray-500">
                          ({post.author.university.name})
                        </span>
                      )}
                      {post.isActive === false && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                      {post._count.reports && post._count.reports > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          <FlagIcon className="h-3 w-3 mr-1" />
                          {post._count.reports} Report{post._count.reports > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{post.author.email}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowWarningModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100"
                    title="Send warning to user"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Warn User
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowDeleteModal(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                    title="Delete post"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Reports Section */}
              {post.reports && post.reports.length > 0 && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FlagIcon className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-orange-900">
                      Reports ({post.reports.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {post.reports.map((report) => (
                      <div key={report.id} className="text-sm">
                        <p className="text-gray-700">
                          <strong>{report.reporter.firstName} {report.reporter.lastName}</strong> reported this post
                          {report.reason && (
                            <span className="block mt-1 text-gray-600 italic">
                              Reason: "{report.reason}"
                            </span>
                          )}
                          <span className="block mt-1 text-xs text-gray-500">
                            Reported on {new Date(report.createdAt).toLocaleString()}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
              </div>

              {/* Media */}
              {post.imageUrl && (
                <div className="mb-4">
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={post.imageUrl}
                      alt="Post image"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              {post.videoUrl && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <VideoCameraIcon className="h-5 w-5" />
                    <span>Video attached</span>
                  </div>
                  <video
                    src={post.videoUrl}
                    controls
                    className="w-full max-w-2xl rounded-lg"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                <span>❤️ {post._count.likes} likes</span>
                <span>💬 {post._count.comments} comments</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Post</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this post by{' '}
                <strong>{selectedPost.author.firstName} {selectedPost.author.lastName}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedPost(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowWarningModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Send Warning to User</h2>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Sending warning to: <strong>{selectedPost.author.firstName} {selectedPost.author.lastName}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Email: <strong>{selectedPost.author.email}</strong>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warning Message
                </label>
                <textarea
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="Enter warning message for the user..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setSelectedPost(null);
                    setWarningMessage('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendWarning}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Send Warning
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

