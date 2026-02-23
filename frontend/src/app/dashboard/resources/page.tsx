'use client';

import { useState, useEffect, useRef } from 'react';
import {
  BookOpenIcon,
  CloudArrowUpIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/dashboard/PageHeader';
import { resourceService, Resource } from '@/services/resourceService';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const typeColors: Record<string, { text: string; bg: string }> = {
  PDF: { text: '#A51C30', bg: '#FFF5F5' },
  DOCX: { text: '#1a2744', bg: '#F0F3FA' },
  Notion: { text: '#059669', bg: '#ECFDF5' },
  IMAGE: { text: '#D97706', bg: '#FFFBEB' },
  PPTX: { text: '#D946EF', bg: '#FDF4FF' },
  OTHER: { text: '#6B7280', bg: '#F9FAFB' },
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');

  // Upload form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '', // In a real app, this would be from a file upload service
    fileType: 'PDF',
    courseId: '',
    semesterId: '',
  });

  useEffect(() => {
    fetchData();
    loadFilters();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getResources({
        type: selectedType === 'All' ? undefined : selectedType,
        courseId: selectedCourse === 'All' ? undefined : selectedCourse,
      });
      setResources(data.resources || []);
    } catch (error: any) {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [courseData, semesterData] = await Promise.all([
        resourceService.getCourses(),
        resourceService.getSemesters(),
      ]);
      setCourses(courseData.courses || []);
      setSemesters(semesterData.semesters || []);
    } catch (error) {
      console.error('Failed to load filters');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.fileUrl || !formData.courseId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await resourceService.uploadResource(formData);
      toast.success('Resource shared successfully!');
      setShowUploadModal(false);
      setFormData({ title: '', description: '', fileUrl: '', fileType: 'PDF', courseId: '', semesterId: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to upload resource');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this resource?')) return;
    try {
      await resourceService.deleteResource(id);
      toast.success('Resource removed');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.course?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${Math.round(kb)} KB`;
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <PageHeader
        title="Resource Bank"
        subtitle="Download curated notes, summaries, and past papers from your peers"
        icon={BookOpenIcon}
        iconColor="#1a2744"
        iconBg="#F0F3FA"
        actions={
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-all shadow-lg shadow-[#A51C30]/20 active:scale-95"
          >
            <CloudArrowUpIcon className="w-4 h-4" strokeWidth={2.5} />
            Share Resource
          </button>
        }
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16 space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, course or code…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-5 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setTimeout(fetchData, 10); }}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 transition-all cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="PDF">PDF</option>
              <option value="DOCX">DOCX</option>
              <option value="Notion">Notion</option>
              <option value="PPTX">PPTX</option>
            </select>
            <select
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setTimeout(fetchData, 10); }}
              className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 transition-all cursor-pointer max-w-[140px]"
            >
              <option value="All">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-50 p-6 flex gap-4 animate-pulse">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl" />
                <div className="flex-1 space-y-3">
                  <div className="w-2/3 h-4 bg-gray-50 rounded-full" />
                  <div className="w-1/3 h-3 bg-gray-50 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[32px] border border-dashed border-gray-100">
            <div className="w-20 h-20 bg-[#F0F3FA] rounded-full flex items-center justify-center mb-6">
              <BookOpenIcon className="w-10 h-10 text-[#1a2744]/20" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No resources found</h3>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-xs px-6">
              Try adjusting your filters or be the first to share a resource for this course.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources.map((r) => {
              const tc = typeColors[r.fileType] || typeColors.OTHER;
              return (
                <div
                  key={r.id}
                  className="group bg-white rounded-[28px] border border-gray-100 p-5 flex gap-4 hover:shadow-xl hover:shadow-[#1a2744]/5 hover:border-[#1a2744]/10 transition-all relative overflow-hidden"
                >
                  {/* Type Banner */}
                  <div
                    className="w-1.5 absolute left-0 top-0 bottom-0"
                    style={{ backgroundColor: tc.text }}
                  />

                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-sm font-black shadow-inner"
                    style={{ background: tc.bg, color: tc.text }}
                  >
                    {r.fileType}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-[15px] font-bold text-[#1a2744] truncate group-hover:text-[#A51C30] transition-colors leading-tight">
                      {r.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#A51C30]">
                        {r.course?.code || 'GEN'}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-[11px] font-bold text-gray-400 capitalize">
                        {formatSize(r.fileSize)}
                      </span>
                      <span className="text-gray-200">·</span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.uploaderId === user?.id && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                    <a
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#F0F3FA] text-[#1a2744] flex items-center justify-center hover:bg-[#A51C30] hover:text-white transition-all active:scale-90"
                      title="Download"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to action */}
        <div className="bg-[#1a2744] rounded-[32px] p-8 relative overflow-hidden shadow-2xl shadow-[#1a2744]/20 flex flex-col md:flex-row items-center gap-8">
          {/* Decorative element */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#A51C30]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-[24px] bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
            <AcademicCapIcon className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">Build the Campus Archive</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xl">
              CustConnect is a community-driven hub. Sharing your lecture notes and past papers helps dozens of fellow students and improves everyone's learning journey.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex-shrink-0 px-8 py-4 rounded-[22px] text-sm font-black text-[#1a2744] bg-white hover:bg-[#F8F7F4] transition-all active:scale-95 shadow-xl"
          >
            Share Now
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-black text-[#1a2744] mb-2">Share Resource</h2>
            <p className="text-gray-400 font-medium mb-8">Help your fellow students ace their exams!</p>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1a2744]/10 rounded-[20px] p-4 text-sm font-bold text-[#1a2744] outline-none transition-all"
                  placeholder="e.g., Midterm Summary - Data Structures"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Course *</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1a2744]/10 rounded-[20px] p-4 text-sm font-bold text-[#1a2744] outline-none transition-all cursor-pointer"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Type *</label>
                  <select
                    required
                    value={formData.fileType}
                    onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1a2744]/10 rounded-[20px] p-4 text-sm font-bold text-[#1a2744] outline-none transition-all cursor-pointer"
                  >
                    {['PDF', 'DOCX', 'Notion', 'PPTX', 'IMAGE', 'OTHER'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Semester (Optional)</label>
                <select
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1a2744]/10 rounded-[20px] p-4 text-sm font-bold text-[#1a2744] outline-none transition-all cursor-pointer"
                >
                  <option value="">Any Semester</option>
                  {semesters.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">File URL *</label>
                <input
                  type="url"
                  required
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#1a2744]/10 rounded-[20px] p-4 text-sm font-bold text-[#1a2744] outline-none transition-all"
                  placeholder="Link to PDF, Google Drive, or Notion"
                />
                <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter px-2">Ensure the link is public or shared with the university domain.</p>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] bg-[#A51C30] text-white py-5 rounded-[22px] font-black shadow-xl shadow-[#A51C30]/25 disabled:opacity-30 active:scale-95 transition-all"
                >
                  {submitting ? 'Sharing…' : 'Finalize & Share'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 border-2 border-gray-100 py-5 rounded-[22px] font-black text-gray-400 active:scale-95 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


