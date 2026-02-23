'use client';

import { useState, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import {
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  XMarkIcon,
  PlusIcon,
  ClockIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import PageHeader from '@/components/dashboard/PageHeader';

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
      toast.success('Event created!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', location: '', startDate: '', endDate: '' });
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleRSVP = async (eventId: string) => {
    try {
      await eventService.rsvpEvent(eventId, 'GOING');
      toast.success('RSVP confirmed!');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to RSVP');
    }
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getDateParts = (ds: string) => {
    const d = new Date(ds);
    return {
      day: d.toLocaleDateString('en-US', { day: 'numeric' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <PageHeader
        title="Campus Events"
        subtitle="Discover what's happening across campus and reserve your spot"
        icon={CalendarDaysIcon}
        iconColor="#059669"
        iconBg="#ECFDF5"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors shadow-sm"
          >
            <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
            Create Event
          </button>
        }
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1a2744]">Create New Event</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Spring Tech Fair 2026"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's this event about?"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/40 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Main Auditorium"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/40 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744]/40 transition"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCreateEvent}
                    disabled={creating}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Creating…' : 'Create Event'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <div className="w-8 h-8 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Loading events…</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] flex items-center justify-center">
              <CalendarDaysIcon className="w-8 h-8 text-[#059669]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-700">No events yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to create a campus event</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors"
            >
              <PlusIcon className="w-4 h-4" strokeWidth={2.5} />
              Create First Event
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const parts = getDateParts(event.startDate);
              const isGoing = event.userRSVP === 'GOING';
              return (
                <div
                  key={event.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
                >
                  {/* Date badge strip */}
                  <div className="h-1.5 bg-[#1a2744]" />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Date badge */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <div className="text-2xl font-bold text-[#1a2744] leading-none">{parts.day}</div>
                        <div className="text-xs font-semibold text-[#A51C30] uppercase tracking-wide mt-0.5">{parts.month}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-[#1a2744] transition-colors">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{event.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{parts.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <UsersIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{event.rsvpCount} attending</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRSVP(event.id)}
                      className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${isGoing
                          ? 'bg-[#ECFDF5] text-[#059669] border border-[#059669]/20'
                          : 'bg-[#1a2744] text-white hover:bg-[#0f1929]'
                        }`}
                    >
                      {isGoing && <CheckBadgeIcon className="w-4 h-4" />}
                      {isGoing ? 'Going ✓' : 'RSVP Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
