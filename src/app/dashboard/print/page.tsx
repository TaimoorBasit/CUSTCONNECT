'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PrinterIcon from '@heroicons/react/24/outline/PrinterIcon';
import DocumentArrowUpIcon from '@heroicons/react/24/outline/DocumentArrowUpIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/solid/ClockIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

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
  printerShop: {
    id: string;
    name: string;
    location?: string;
    phone?: string;
  };
}

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

  useEffect(() => {
    fetchShops();
    fetchMyRequests();
  }, []);

  const fetchShops = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/print/shops`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setShops(response.data.shops || []);
        if (response.data.shops && response.data.shops.length > 0) {
          setSelectedShop(response.data.shops[0]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      toast.error('Failed to load printer shops');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/print/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMyRequests(response.data.requests || []);
      }
    } catch (error: any) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (selectedFile.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }

      const allowedTypes = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'image/gif', 'text/plain'];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, images, and TXT files are allowed.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShop) {
      toast.error('Please select a printer shop');
      return;
    }

    if (!file) {
      toast.error('Please select a file to print');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('printerShopId', selectedShop.id);
      formData.append('printType', printType);
      formData.append('copies', copies.toString());
      if (notes) {
        formData.append('notes', notes);
      }

      const response = await axios.post(`${API_URL}/print/request`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Print request submitted successfully!');
        setFile(null);
        setCopies(1);
        setNotes('');
        setPrintType('BLACK_WHITE');
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchMyRequests();
      }
    } catch (error: any) {
      console.error('Error submitting print request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit print request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'READY': return 'text-blue-600 bg-blue-100';
      case 'PROCESSING': return 'text-yellow-600 bg-yellow-100';
      case 'PENDING': return 'text-gray-600 bg-gray-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon className="w-5 h-5" />;
      case 'READY': return <CheckCircleIcon className="w-5 h-5" />;
      case 'PROCESSING': return <ClockIcon className="w-5 h-5" />;
      case 'PENDING': return <ClockIcon className="w-5 h-5" />;
      case 'CANCELLED': return <XCircleIcon className="w-5 h-5" />;
      default: return <ClockIcon className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http')) return fileUrl;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${fileUrl}`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading printer shops...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Print Service</h1>
        <p className="text-gray-500">Upload your documents and send them to printer shops for printing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Print Request */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Print Request</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Printer Shop Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Printer Shop *
                </label>
                <select
                  value={selectedShop?.id || ''}
                  onChange={(e) => {
                    const shop = shops.find(s => s.id === e.target.value);
                    setSelectedShop(shop || null);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a printer shop</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name} {shop.location && `- ${shop.location}`}
                    </option>
                  ))}
                </select>
                {selectedShop && selectedShop.description && (
                  <p className="mt-1 text-sm text-gray-500">{selectedShop.description}</p>
                )}
                {selectedShop && selectedShop.ownerId && (
                  <div className="mt-2">
                    <a
                      href={`/dashboard/messages?userId=${selectedShop.ownerId}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                      </svg>
                      Message Shop Owner
                    </a>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-input" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload a file</span>
                        <input
                          id="file-input"
                          name="file"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, images, TXT up to 10MB</p>
                    {file && (
                      <p className="text-sm text-gray-900 font-medium mt-2">{file.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Print Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Print Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="BLACK_WHITE"
                      checked={printType === 'BLACK_WHITE'}
                      onChange={(e) => setPrintType(e.target.value as 'BLACK_WHITE')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Black & White</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="COLOR"
                      checked={printType === 'COLOR'}
                      onChange={(e) => setPrintType(e.target.value as 'COLOR')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Color</span>
                  </label>
                </div>
              </div>

              {/* Copies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Copies *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Any special instructions for printing..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !file || !selectedShop}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <PrinterIcon className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Print Request'}
              </button>
            </form>
          </div>
        </div>

        {/* My Requests */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">My Print Requests</h2>

            {myRequests.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No print requests yet</p>
            ) : (
              <div className="space-y-3">
                {myRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{request.fileName}</p>
                        <p className="text-xs text-gray-500">{request.printerShop.name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>{request.printType === 'COLOR' ? 'Color' : 'B&W'} • {request.copies} copy{request.copies > 1 ? 'ies' : ''}</p>
                      <p>{formatDate(request.createdAt)}</p>
                      {request.price && (
                        <p className="font-medium text-gray-700">Price: ${Number(request.price).toFixed(2)}</p>
                      )}
                    </div>
                    {request.status === 'READY' && (
                      <a
                        href={getFileUrl(request.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700"
                      >
                        View Document →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}





