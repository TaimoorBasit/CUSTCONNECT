'use client';

import { useState, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import { toast } from 'react-hot-toast';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents({ page: 1, limit: 20 });
      setEvents(data?.events || []);
    } catch (error: any) {
      console.error('Failed to fetch events:', error);
      toast.error(error.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.startDate) {
      toast.error('Title and start date are required');
      return;
    }

    try {
      setCreating(true);
      await eventService.createEvent({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
      });
      toast.success('Event created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        startDate: '',
        endDate: '',
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to create event:', error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      await eventService.rsvpEvent(eventId, 'GOING');
      toast.success('RSVP successful!');
      fetchEvents();
    } catch (error: any) {
      console.error('Failed to RSVP:', error);
      toast.error(error.message || 'Failed to RSVP');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="text-gray-500">See what's coming up across campus and reserve your spot.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <CalendarDaysIcon className="mr-2 h-5 w-5" />
          Create Event
        </button>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" onClick={() => setShowCreateModal(false)} />
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Event title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Event location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateEvent}
                    disabled={creating}
                    className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Event'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        <div className="text-center py-12">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events yet. Create the first event!</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between text-sm text-blue-700">
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {formatDate(event.startDate)}
                </span>
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <UsersIcon className="h-4 w-4" />
                  {event.rsvpCount} RSVPs
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{event.title}</h3>
              {event.description && (
                <p className="mt-2 text-sm text-gray-600">{event.description}</p>
              )}
              {event.location && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4" />
                  {event.location}
                </div>
              )}
              <button
                onClick={() => handleRSVP(event.id)}
                className="mt-6 w-full rounded-md border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
              >
                {event.userRSVP ? `RSVP: ${event.userRSVP}` : 'RSVP'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
