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
  FlagIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon
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
      const data = await adminService.getPosts({
        page: 1,
        limit: 100,
        showAll: true,
        reportedOnly: showReportedOnly
      });
      setPosts(data.posts || []);
      setLoading(false);
    } catch (error: any) {
      toast.error('Failed to access moderation archives');
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
      toast.success('Content purged from ecosystem');
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      setShowDeleteModal(false);
      setSelectedPost(null);
    } catch (error: any) {
      toast.error(error.message || 'Purge protocol failed');
    }
  };

  const handleSendWarning = async () => {
    if (!selectedPost || !warningMessage.trim()) {
      toast.error('Warning communique cannot be empty');
      return;
    }
    try {
      await adminService.sendWarningToUser(selectedPost.author.id, warningMessage);
      toast.success('Governance warning dispatched');
      setShowWarningModal(false);
      setSelectedPost(null);
      setWarningMessage('');
    } catch (error: any) {
      toast.error(error.message || 'Dispatch failed');
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

  if (loading && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse text-xs uppercase tracking-[0.2em]">Scanning social ecosystem...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0 font-sans">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-violet-400/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Content Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Moderation <span className="text-indigo-400">Ledger</span>
          </h1>
          <p className="text-indigo-100/60 font-medium max-w-2xl leading-relaxed">
            Monitor the social pulse. Review flagged interactions and maintain the platform's standard of discourse.
          </p>
        </div>
      </div>

      {/* Modernized Controls */}
      <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6">
        <div className="flex-[2] relative group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Search Feed</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author, email, or content..."
              className="w-full rounded-[24px] bg-gray-50 border border-transparent px-16 py-4.5 font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-gray-300 shadow-inner"
            />
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Visibility Protocol</label>
          <button
            onClick={() => setShowReportedOnly(!showReportedOnly)}
            className={`flex items-center justify-center gap-3 px-8 py-4.5 rounded-[24px] font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 border ${showReportedOnly
                ? 'bg-rose-500 text-white border-rose-600 shadow-xl shadow-rose-500/20'
                : 'bg-white text-gray-400 border-gray-100 hover:text-indigo-600 hover:border-indigo-100'
              }`}
          >
            <FlagIcon className={`h-4 w-4 ${showReportedOnly ? 'animate-pulse' : ''}`} />
            {showReportedOnly ? 'Reviewing Flags' : 'All Transmissions'}
          </button>
        </div>
      </div>

      {/* Dispatched Posts List */}
      <div className="space-y-8">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-[40px] p-32 text-center border border-dashed border-gray-100">
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-8 text-indigo-400/50">
              <ShieldCheckIcon className="h-12 w-12 stroke-[1.5]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Zero Infractions</h3>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed uppercase text-[10px] tracking-widest">The ecosystem is within operational safety parameters.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="group bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-black/5 transition-all duration-700">
              {/* Post Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-900 rounded-[22px] flex items-center justify-center text-white font-black text-xl shadow-xl group-hover:scale-105 transition-transform duration-500">
                      {post.author.firstName[0]}{post.author.lastName[0]}
                    </div>
                    {post.isActive === false && (
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-lg border-4 border-white">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                        {post.author.firstName} {post.author.lastName}
                      </h3>
                      {post.isActive === false && (
                        <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] bg-rose-500 text-white shadow-sm shadow-rose-500/20">
                          Suspended
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{post.author.email}</p>
                      <div className="w-1.5 h-1.5 bg-gray-200 rounded-full hidden md:block" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        EST. {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowWarningModal(true);
                    }}
                    className="px-6 py-4 rounded-[20px] bg-amber-50 text-amber-600 font-black text-[10px] tracking-widest uppercase hover:bg-amber-500 hover:text-white transition-all active:scale-95 shadow-sm border border-amber-100"
                  >
                    Send Warning
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      setShowDeleteModal(true);
                    }}
                    className="px-6 py-4 rounded-[20px] bg-rose-50 text-rose-500 font-black text-[10px] tracking-widest uppercase hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm border border-rose-100"
                  >
                    Bury Content
                  </button>
                </div>
              </div>

              {/* Reports Analysis */}
              {post.reports && post.reports.length > 0 && (
                <div className="mb-10 p-8 bg-rose-50/50 rounded-[32px] border border-rose-100/50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/20 rounded-bl-full -z-0"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                        <FlagIcon className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">
                        Flagged Incursions ({post.reports.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {post.reports.map((report) => (
                        <div key={report.id} className="p-5 bg-white rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
                          <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <UserCircleIcon className="w-3.5 h-3.5" />
                            Agent: {report.reporter.firstName}
                          </p>
                          <p className="text-sm text-gray-700 font-bold italic leading-relaxed">"{report.reason || 'No detailed rationale provided.'}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Feed Transmission */}
              <div className="mb-10 space-y-8">
                <div className="relative group/content">
                  <p className="text-xl leading-relaxed text-gray-700 font-medium whitespace-pre-wrap pl-6 border-l-4 border-indigo-500/20 group-hover/content:border-indigo-500 transition-colors">
                    {post.content}
                  </p>
                </div>

                {(post.imageUrl || post.videoUrl) && (
                  <div className="rounded-[40px] overflow-hidden border border-gray-100 shadow-inner group/media">
                    {post.imageUrl && (
                      <div className="relative aspect-video w-full bg-gray-50">
                        <Image
                          src={post.imageUrl}
                          alt="Feed visual transmission"
                          fill
                          className="object-cover group-hover/media:scale-105 transition-transform duration-1000"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity"></div>
                      </div>
                    )}
                    {post.videoUrl && (
                      <div className="p-1 bg-black aspect-video flex items-center justify-center">
                        <video
                          src={post.videoUrl}
                          controls
                          className="w-full h-full rounded-[36px] shadow-2xl"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Engagement Manifest */}
              <div className="flex flex-wrap items-center gap-6 pt-10 border-t border-gray-50">
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-default">
                  <HeartIcon className="h-4 w-4" />
                  {post._count.likes} Approvals
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-indigo-50 hover:text-indigo-500 transition-all cursor-default">
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  {post._count.comments} Communiques
                </div>
                {post.author.university && (
                  <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-[20px] font-black text-[9px] text-white uppercase tracking-[0.2em] ml-auto">
                    {post.author.university.name} Sector
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal (Luxury Style) */}
      {showDeleteModal && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-12">
            <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-md w-full p-10 overflow-hidden transform transition-all border border-white/20">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center space-y-8">
                <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-rose-50 shadow-inner">
                  <TrashIcon className="h-10 w-10 text-rose-500" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Content Purge</h3>
                  <p className="text-gray-400 font-medium leading-relaxed italic text-sm">
                    Executing permanent removal of communique by <span className="text-gray-900 font-black">"{selectedPost.author.firstName} {selectedPost.author.lastName}"</span>. This protocol is irreversible.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDelete}
                    className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-600/30 hover:bg-black transition-all active:scale-95"
                  >
                    Purge Content
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedPost(null);
                    }}
                    className="w-full py-5 bg-gray-50 text-gray-500 rounded-[24px] font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Abort Protocol
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal (Luxury Style) */}
      {showWarningModal && selectedPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-12">
            <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setShowWarningModal(false)} />
            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-xl w-full overflow-hidden transform transition-all border border-white/20">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>

              <div className="flex items-center justify-between p-10 border-b border-gray-50">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Governance Alert</h2>
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Agent: {selectedPost.author.firstName} {selectedPost.author.lastName}</p>
                </div>
                <button onClick={() => setShowWarningModal(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-300 hover:text-gray-900 transition-all">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 block">Official communique rationale</label>
                  <textarea
                    value={warningMessage}
                    onChange={(e) => setWarningMessage(e.target.value)}
                    placeholder="Specify the policy violation or corrective action required..."
                    rows={5}
                    className="w-full px-8 py-6 bg-gray-50 border border-transparent rounded-[32px] font-bold text-gray-900 focus:bg-white focus:border-amber-500/20 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all placeholder:text-gray-300 shadow-inner resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={handleSendWarning}
                    className="px-12 py-5 bg-amber-500 text-white rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-amber-500/20 hover:bg-black transition-all active:scale-95"
                  >
                    Dispatch Warning
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

