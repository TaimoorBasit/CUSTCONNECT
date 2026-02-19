'use client';

import { useState, useEffect } from 'react';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';

interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: {
      name: string;
    };
  };
  university?: {
    id: string;
    name: string;
  };
  _count: {
    rsvps: number;
  };
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getEvents({ page: 1, limit: 100 });
      setEvents(data.events || []);
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load events');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      await adminService.deleteEvent(selectedEvent.id);
      toast.success('Event deleted successfully');
      setShowDeleteModal(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Events Management</h1>
        <p className="text-gray-500">Manage all events created by users.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {events.length === 0 ? (
          <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">No events have been created yet.</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.startDate).toLocaleString()}</span>
                    {event.endDate && (
                      <span> - {new Date(event.endDate).toLocaleString()}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600">{event.description}</p>
                  )}
                  {event.location && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>Organized by: {event.organizer.firstName} {event.organizer.lastName}</span>
                    {event.organizer.university && (
                      <span>({event.organizer.university.name})</span>
                    )}
                  </div>
                  {event.university && (
                    <p className="mt-1 text-xs text-gray-400">{event.university.name}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <UsersIcon className="h-4 w-4" />
                    <span>{event._count.rsvps} RSVPs</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowDeleteModal(true);
                  }}
                  className="ml-4 inline-flex items-center px-3 py-1 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Confirm Delete Event</h2>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete "{selectedEvent.title}" organized by{' '}
                <span className="font-semibold">{selectedEvent.organizer.firstName} {selectedEvent.organizer.lastName}</span>?
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

