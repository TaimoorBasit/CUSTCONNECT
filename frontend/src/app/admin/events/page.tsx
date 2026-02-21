'use client';

import { useState, useEffect } from 'react';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import ExclamationTriangleIcon from '@heroicons/react/24/outline/ExclamationTriangleIcon';
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Gathering community events...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1b3b] to-indigo-900 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -m-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white">
              Campus <span className="text-indigo-400">Hub</span>
            </h1>
            <p className="text-indigo-100/60 font-medium max-w-md">
              Oversee and moderate all community gatherings and social activities across campus.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10">
            <div className="p-3 bg-indigo-500/20 rounded-2xl">
              <CalendarIcon className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-300 uppercase tracking-widest text-gray-900">Total Live</p>
              <p className="text-2xl font-black text-white">{events.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-6 bg-gray-50 rounded-full">
              <CalendarIcon className="h-12 w-12 text-gray-300" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">Quiet on campus?</h3>
              <p className="text-gray-500 font-medium">No events have been scheduled yet.</p>
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-[32px] p-2 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div className="bg-gray-50 rounded-[28px] p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black uppercase tracking-wider">
                    <ClockIcon className="h-3.5 w-3.5" />
                    <span>Upcoming</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowDeleteModal(true);
                    }}
                    className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3 mt-auto pt-6 border-t border-gray-200/50">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                      <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span>{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                        <MapPinIcon className="h-4 w-4 text-rose-500" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                      <UserIcon className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="truncate">{event.organizer.firstName} {event.organizer.lastName}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, event._count.rsvps))].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-indigo-500" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-black text-gray-400">
                      {event._count.rsvps > 0 ? `+${event._count.rsvps} joined` : 'Be the first'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl">
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-black text-gray-900">{event._count.rsvps}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            <div
              className="fixed inset-0 bg-[#1a1b3b]/80 backdrop-blur-md transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            />

            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-md w-full p-8 overflow-hidden transform transition-all border border-white/20">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center space-y-6">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-rose-100 shadow-inner">
                  <ExclamationTriangleIcon className="h-10 w-10 text-rose-600" aria-hidden="true" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Cancel Event?</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    You are about to permanently remove <span className="text-gray-900 font-black">"{selectedEvent.title}"</span>.
                    This cannot be undone and will notify all participants.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={handleDelete}
                    className="w-full py-4 bg-rose-500 text-white rounded-3xl font-black shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all active:scale-[0.98]"
                  >
                    Yes, Cancel Event
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full py-4 bg-gray-100 text-gray-600 rounded-3xl font-black hover:bg-gray-200 transition-all"
                  >
                    Keep Event
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

