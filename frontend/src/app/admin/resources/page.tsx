'use client';

import { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  UserCircleIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface Resource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  isActive: boolean;
  createdAt: string;
  uploader: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: {
      name: string;
    };
  };
  course?: {
    id: string;
    name: string;
    code: string;
    university?: {
      name: string;
    };
  };
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await adminService.getResources({ page: 1, limit: 100 });
      setResources(data.resources || []);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to access academic archives');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    try {
      await adminService.deleteResource(selectedResource.id);
      toast.success('Material purged from architecture');
      setShowDeleteModal(false);
      setSelectedResource(null);
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Purge protocol failed');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredResources = resources.filter(res =>
    res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.uploader.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.course?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold animate-pulse text-[10px] uppercase tracking-[0.2em]">Auditing academic assets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0 font-sans">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-slate-400/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Resource Governance
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Curriculum <span className="text-indigo-400">Vault</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-2xl leading-relaxed">
            Manage institutional knowledge. Monitor, verify, and moderate intellectual assets contributed by the student community.
          </p>
        </div>
      </div>

      {/* Modern Controls */}
      <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Filter Assets</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, uploader, or course..."
              className="w-full rounded-[24px] bg-gray-50 border border-transparent px-16 py-4.5 font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-gray-300 shadow-inner"
            />
          </div>
        </div>
        <div className="flex-none flex items-end">
          <div className="px-6 py-4.5 bg-indigo-50/50 rounded-[24px] border border-indigo-50 flex items-center gap-3">
            <DocumentDuplicateIcon className="w-5 h-5 text-indigo-500" />
            <p className="text-xs font-black text-indigo-900 uppercase tracking-tighter">
              {filteredResources.length} Assets Identified
            </p>
          </div>
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full bg-white rounded-[40px] p-32 text-center border border-dashed border-gray-100 italic">
            <DocumentIcon className="h-16 w-16 text-gray-200 mx-auto mb-6 stroke-[1.5]" />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">No assets found in current sector.</p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div key={resource.id} className="group bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-black/5 transition-all duration-500 flex flex-col">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-[24px] group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                  <DocumentIcon className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="flex gap-2">
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </a>
                  <button
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowDeleteModal(true);
                    }}
                    className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm border border-rose-100"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-4 mb-8 flex-grow">
                <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {resource.title}
                </h3>
                {resource.description && (
                  <p className="text-sm text-gray-400 font-medium leading-relaxed italic line-clamp-3">
                    "{resource.description}"
                  </p>
                )}
              </div>

              {/* Metadata Cluster */}
              <div className="space-y-4 pt-6 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-900 shadow-inner">
                    {resource.uploader.firstName[0]}{resource.uploader.lastName[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Architect</p>
                    <p className="text-xs font-bold text-gray-900">{resource.uploader.firstName} {resource.uploader.lastName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="px-4 py-2 bg-gray-50 rounded-xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Scale</p>
                    <p className="text-[10px] font-black text-slate-900">{formatFileSize(resource.fileSize)}</p>
                  </div>
                  <div className="px-4 py-2 bg-gray-50 rounded-xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Extension</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter">{resource.fileType.split('/').pop()}</p>
                  </div>
                </div>

                {resource.course && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50/50 rounded-2xl border border-indigo-50">
                    <AcademicCapIcon className="w-4 h-4 text-indigo-400" />
                    <p className="text-[10px] font-black text-indigo-900 uppercase tracking-tighter truncate">
                      {resource.course.code} • {resource.course.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal (Luxury Style) */}
      {showDeleteModal && selectedResource && (
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
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Material Purge</h3>
                  <p className="text-gray-400 font-medium leading-relaxed italic text-sm">
                    Executing permanent removal of <span className="text-gray-900 font-black">"{selectedResource.title}"</span>. This protocol is irreversible.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleDelete}
                    className="w-full py-5 bg-rose-600 text-white rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-600/30 hover:bg-black transition-all active:scale-95"
                  >
                    Purge Asset
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedResource(null);
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
    </div>
  );
}

