'use client';

import { useState, useEffect } from 'react';
import BookOpenIcon from '@heroicons/react/24/outline/BookOpenIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
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
      toast.error(error.message || 'Failed to load resources');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    try {
      await adminService.deleteResource(selectedResource.id);
      toast.success('Resource deleted successfully');
      setShowDeleteModal(false);
      setSelectedResource(null);
      fetchResources();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete resource');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Resources Management</h1>
        <p className="text-gray-500">Manage all academic resources uploaded by students.</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {resources.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No resources found
            </li>
          ) : (
            resources.map((resource) => (
              <li key={resource.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <BookOpenIcon className="h-6 w-6 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                        {resource.description && (
                          <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>Uploaded by: {resource.uploader.firstName} {resource.uploader.lastName}</span>
                          {resource.uploader.university && (
                            <span>({resource.uploader.university.name})</span>
                          )}
                          {resource.course && (
                            <span>• Course: {resource.course.code} - {resource.course.name}</span>
                          )}
                          <span>• Type: {resource.fileType}</span>
                          <span>• Size: {formatFileSize(resource.fileSize)}</span>
                          <span>• {new Date(resource.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      View
                    </a>
                    <button
                      onClick={() => {
                        setSelectedResource(resource);
                        setShowDeleteModal(true);
                      }}
                      className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedResource && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete Resource</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete "{selectedResource.title}" uploaded by{' '}
                <span className="font-semibold">{selectedResource.uploader.firstName} {selectedResource.uploader.lastName}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

