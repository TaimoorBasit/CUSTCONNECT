'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  PrinterIcon,
  DocumentArrowUpIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import PageHeader from '@/components/dashboard/PageHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface PrinterShop {
  id: string;
  name: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  ownerId?: string;
}

interface PrintRequest {
  id: string;
  fileName: string;
  fileUrl: string;
  printType: 'BLACK_WHITE' | 'COLOR';
  copies: number;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  price?: number;
  createdAt: string;
  printerShop: { id: string; name: string; location?: string; phone?: string };
}

const STATUS_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  COMPLETED: { text: '#059669', bg: '#ECFDF5', border: '#059669' },
  READY: { text: '#0369A1', bg: '#F0F9FF', border: '#0369A1' },
  PROCESSING: { text: '#D97706', bg: '#FFFBEB', border: '#D97706' },
  PENDING: { text: '#6B7280', bg: '#F9FAFB', border: '#D1D5DB' },
  CANCELLED: { text: '#A51C30', bg: '#FFF5F5', border: '#A51C30' },
};

export default function PrintServicePage() {
  const [shops, setShops] = useState<PrinterShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<PrinterShop | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [printType, setPrintType] = useState<'BLACK_WHITE' | 'COLOR'>('BLACK_WHITE');
  const [copies, setCopies] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<PrintRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchShops(); fetchMyRequests(); }, []);

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/print/shops`, { headers: { Authorization: `Bearer ${token?.trim()}` } });
      if (res.data.success) {
        setShops(res.data.shops || []);
        if (res.data.shops?.length > 0) setSelectedShop(res.data.shops[0]);
      }
    } catch { toast.error('Failed to load printer shops'); }
    finally { setLoading(false); }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/print/my-requests`, { headers: { Authorization: `Bearer ${token?.trim()}` } });
      if (res.data.success) setMyRequests(res.data.requests || []);
    } catch { }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    if (!allowed.includes(f.type)) { toast.error('Only PDF, DOC, DOCX, image, and TXT files allowed'); return; }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) { toast.error('Select a printer shop'); return; }
    if (!file) { toast.error('Select a file to print'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('printerShopId', selectedShop.id);
      fd.append('printType', printType);
      fd.append('copies', copies.toString());
      if (notes) fd.append('notes', notes);
      const res = await axios.post(`${API_URL}/print/request`, fd, {
        headers: { Authorization: `Bearer ${token?.trim()}`, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Print request submitted!');
        setFile(null); setCopies(1); setNotes(''); setPrintType('BLACK_WHITE');
        const fi = document.getElementById('file-input') as HTMLInputElement;
        if (fi) fi.value = '';
        fetchMyRequests();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setSubmitting(false); }
  };

  const getFileUrl = (url: string) => url.startsWith('http') ? url : `${API_URL.replace('/api', '')}${url}`;
  const formatDate = (ds: string) => new Date(ds).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        <PageHeader title="Print Centre" subtitle="Submit documents to campus printer shops" icon={PrinterIcon} iconColor="#7C3AED" iconBg="#F5F3FF" />
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-8 h-8 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading printer shops…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <PageHeader
        title="Print Centre"
        subtitle="Upload documents and send them to campus printer shops"
        icon={PrinterIcon}
        iconColor="#7C3AED"
        iconBg="#F5F3FF"
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Submit Request Form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-[#1a2744]">New Print Request</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Shop selector */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Printer Shop *</label>
                  <select
                    value={selectedShop?.id || ''}
                    onChange={(e) => setSelectedShop(shops.find((s) => s.id === e.target.value) || null)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/30 transition"
                    required
                  >
                    <option value="">Select a printer shop</option>
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}{s.location ? ` · ${s.location}` : ''}</option>
                    ))}
                  </select>
                  {selectedShop && (
                    <div className="mt-3 flex items-start justify-between gap-3 p-3 bg-[#F5F3FF] rounded-xl border border-[#7C3AED]/10">
                      <div>
                        {selectedShop.description && <p className="text-xs text-gray-600">{selectedShop.description}</p>}
                        {selectedShop.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <MapPinIcon className="w-3 h-3" /> {selectedShop.location}
                          </div>
                        )}
                      </div>
                      {selectedShop.ownerId && (
                        <a
                          href={`/dashboard/messages?userId=${selectedShop.ownerId}`}
                          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold text-[#7C3AED] hover:underline"
                        >
                          <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" /> Message
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* File upload */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Document *</label>
                  <label
                    htmlFor="file-input"
                    className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-[#7C3AED]/30 bg-[#F5F3FF]' : 'border-gray-200 bg-gray-50 hover:border-[#7C3AED]/30 hover:bg-[#F5F3FF]'
                      }`}
                  >
                    <DocumentArrowUpIcon className={`w-8 h-8 ${file ? 'text-[#7C3AED]' : 'text-gray-300'}`} strokeWidth={1.5} />
                    {file ? (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[#7C3AED]">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB — click to change</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-500">Click to upload</p>
                        <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, image, TXT · max 10 MB</p>
                      </div>
                    )}
                    <input id="file-input" name="file" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt" />
                  </label>
                </div>

                {/* Print type */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Print Type *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['BLACK_WHITE', 'COLOR'] as const).map((t) => (
                      <label
                        key={t}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${printType === t
                            ? 'border-[#7C3AED] bg-[#F5F3FF]'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                      >
                        <input
                          type="radio"
                          value={t}
                          checked={printType === t}
                          onChange={() => setPrintType(t)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${printType === t ? 'border-[#7C3AED]' : 'border-gray-300'}`}>
                          {printType === t && <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{t === 'BLACK_WHITE' ? 'Black & White' : 'Colour'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Copies */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Copies *</label>
                  <input
                    type="number" min={1} max={100}
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/30 transition"
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Special Instructions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]/30 transition resize-none"
                    placeholder="e.g., staple, double-sided, specific paper size…"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !file || !selectedShop}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6d28d9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <PrinterIcon className="w-4 h-4" strokeWidth={2} />
                  {submitting ? 'Submitting…' : 'Submit Print Request'}
                </button>
              </form>
            </div>
          </div>

          {/* My Requests sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#1a2744]">My Requests</h2>
                {myRequests.length > 0 && (
                  <span className="text-xs font-semibold text-[#7C3AED] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
                    {myRequests.length}
                  </span>
                )}
              </div>
              <div className="p-4">
                {myRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <ClockIcon className="w-8 h-8 text-gray-200 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-xs text-gray-400">No requests yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.slice(0, 6).map((req) => {
                      const s = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING;
                      return (
                        <div key={req.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-xs font-semibold text-gray-900 truncate flex-1">{req.fileName}</p>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                              style={{ color: s.text, background: s.bg }}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">{req.printerShop.name}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-[10px] text-gray-400">
                              {req.printType === 'COLOR' ? 'Colour' : 'B&W'} · {req.copies} copies
                              {req.price ? ` · $${Number(req.price).toFixed(2)}` : ''}
                            </p>
                            <p className="text-[10px] text-gray-400">{formatDate(req.createdAt)}</p>
                          </div>
                          {req.status === 'READY' && (
                            <a
                              href={getFileUrl(req.fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-[11px] font-semibold text-[#7C3AED] hover:underline block"
                            >
                              View document →
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
