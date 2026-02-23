'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapIcon,
  MegaphoneIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { UserPlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import PageHeader from '@/components/dashboard/PageHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface BusRoute {
  id: string;
  name: string;
  number: string;
  busNumber?: string;
  driverContactNumber?: string;
  description?: string;
  isActive: boolean;
  schedules: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>;
  operator?: { id: string; firstName: string; lastName: string; email: string };
  notifications: Array<{ id: string; title: string; message: string; type: string; createdAt: string }>;
}

export default function BusServicePage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedRouteForEmergency, setSelectedRouteForEmergency] = useState<BusRoute | null>(null);

  useEffect(() => { fetchRoutes(); }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bus/routes`, {
        headers: { Authorization: `Bearer ${token?.trim()}` },
      });
      if (response.data.success) setRoutes(response.data.routes || []);
    } catch {
      toast.error('Failed to load bus routes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ds: string) => {
    const d = new Date(ds), now = new Date(), diff = now.getTime() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const getTodaySchedules = (schedules: BusRoute['schedules']) =>
    schedules.filter((s) => s.dayOfWeek === new Date().getDay());

  const allNotifications = routes
    .flatMap((r) => r.notifications.map((n) => ({ ...n, routeName: r.name, routeNumber: r.number })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4]">
        <PageHeader title="Bus Service" subtitle="Campus transit routes and schedules" icon={MapIcon} iconColor="#1a2744" iconBg="#F0F3FA" />
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="w-8 h-8 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading bus routes…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <PageHeader
        title="Bus Service"
        subtitle="Real-time route info, driver contacts, and live alerts"
        icon={MapIcon}
        iconColor="#1a2744"
        iconBg="#F0F3FA"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#1a2744] bg-white border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
            >
              <MapIcon className="w-4 h-4" strokeWidth={1.8} />
              View Map
            </button>
            <button
              onClick={() => {
                if (routes.length > 0) { setSelectedRouteForEmergency(routes[0]); setShowEmergencyModal(true); }
                else toast.error('No routes available');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors shadow-sm"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              SOS
            </button>
          </div>
        }
      />

      <div className="max-w-5xl mx-auto px-4 md:px-8 pb-16">
        {routes.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F3FA] flex items-center justify-center">
              <MapIcon className="w-8 h-8 text-[#1a2744]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-gray-700">No active routes</p>
              <p className="text-sm text-gray-400 mt-1">Bus routes will appear here when scheduled.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Routes grid */}
            <div className="flex-1">
              <div className="grid gap-4 md:grid-cols-2">
                {routes.map((route) => {
                  const todaySchedules = getTodaySchedules(route.schedules);
                  return (
                    <div key={route.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden">
                      {/* Status bar */}
                      <div className={`h-1 ${route.isActive ? 'bg-[#059669]' : 'bg-gray-200'}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold bg-[#F0F3FA] text-[#1a2744] px-2 py-0.5 rounded-lg">
                                Route {route.number}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${route.isActive ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {route.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-[#1a2744]">{route.name}</h3>
                          </div>
                          {route.operator && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={async () => {
                                  try { await userService.followUser(route.operator!.id); toast.success('Following operator'); }
                                  catch { toast.error('Failed to follow'); }
                                }}
                                title="Follow Operator"
                                className="w-8 h-8 rounded-xl bg-[#F0F3FA] text-[#1a2744] flex items-center justify-center hover:bg-[#1a2744] hover:text-white transition-colors"
                              >
                                <UserPlusIcon className="w-4 h-4" />
                              </button>
                              <a
                                href={`/dashboard/messages?userId=${route.operator.id}`}
                                title="Message Operator"
                                className="w-8 h-8 rounded-xl bg-[#FFF5F5] text-[#A51C30] flex items-center justify-center hover:bg-[#A51C30] hover:text-white transition-colors"
                              >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bus No.</p>
                            <p className="text-sm font-semibold text-gray-900">{route.busNumber || 'N/A'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Driver</p>
                            {route.driverContactNumber ? (
                              <a href={`tel:${route.driverContactNumber}`} className="flex items-center gap-1 text-sm font-semibold text-[#A51C30] hover:underline">
                                <PhoneIcon className="w-3 h-3" /> {route.driverContactNumber}
                              </a>
                            ) : <p className="text-sm text-gray-400">N/A</p>}
                          </div>
                        </div>

                        {route.description && (
                          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3 mb-4 leading-relaxed">{route.description}</p>
                        )}

                        {/* Today's schedule */}
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            Today's Trips
                          </p>
                          {todaySchedules.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {todaySchedules.map((s) => (
                                <span key={s.id} className="text-xs font-medium bg-[#F0F3FA] text-[#1a2744] px-3 py-1 rounded-lg border border-[#1a2744]/10">
                                  {s.startTime} – {s.endTime}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No trips today</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerts sidebar */}
            {allNotifications.length > 0 && (
              <div className="w-full lg:w-72 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-[#A51C30]/10 shadow-sm sticky top-24 overflow-hidden">
                  <div className="px-5 py-4 bg-[#FFF5F5] border-b border-[#A51C30]/10 flex items-center gap-2">
                    <MegaphoneIcon className="w-4 h-4 text-[#A51C30]" />
                    <h3 className="text-sm font-bold text-[#A51C30]">Live Alerts</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {allNotifications.slice(0, 6).map((alert) => (
                      <div key={alert.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-gray-800 line-clamp-1">{alert.title}</p>
                          <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{formatDate(alert.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          <span className="font-semibold text-[#A51C30]">{alert.routeName}:</span> {alert.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMapModal && <RouteMapModal routes={routes} onClose={() => setShowMapModal(false)} />}
      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          routes={routes}
          selectedRoute={selectedRouteForEmergency}
          onClose={() => { setShowEmergencyModal(false); setSelectedRouteForEmergency(null); }}
          onRouteSelect={setSelectedRouteForEmergency}
        />
      )}
    </div>
  );
}

function RouteMapModal({ routes, onClose }: { routes: BusRoute[]; onClose: () => void }) {
  const [selected, setSelected] = useState<BusRoute | null>(routes[0] || null);
  const openMap = (r: BusRoute) =>
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' bus route')}`, '_blank');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1a2744]">Bus Route Map</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-72 border-r border-gray-100 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {routes.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${selected?.id === r.id
                    ? 'bg-[#1a2744] border-[#1a2744] text-white'
                    : 'bg-white border-gray-100 hover:border-gray-200 text-gray-700'
                  }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold line-clamp-1">{r.name}</p>
                    <p className={`text-xs mt-0.5 ${selected?.id === r.id ? 'text-white/60' : 'text-gray-400'}`}>Route {r.number}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${r.isActive
                      ? selected?.id === r.id ? 'bg-white/20 text-white' : 'bg-[#ECFDF5] text-[#059669]'
                      : 'bg-gray-100 text-gray-400'
                    }`}>
                    {r.isActive ? 'Active' : 'Stopped'}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="flex-1 flex items-center justify-center bg-[#F8F7F4] p-8">
            {selected ? (
              <div className="text-center space-y-5 max-w-sm">
                <div className="w-20 h-20 bg-[#F0F3FA] rounded-2xl flex items-center justify-center mx-auto">
                  <MapIcon className="w-10 h-10 text-[#1a2744]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a2744]">{selected.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{selected.description || 'Campus Loop Route'}</p>
                </div>
                <button
                  onClick={() => openMap(selected)}
                  className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] transition-colors shadow-sm"
                >
                  Open in Google Maps
                </button>
              </div>
            ) : <p className="text-gray-400 text-sm">Select a route from the list</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyModal({
  routes, selectedRoute, onClose, onRouteSelect,
}: {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  onClose: () => void;
  onRouteSelect: (r: BusRoute) => void;
}) {
  const [formData, setFormData] = useState({
    routeId: selectedRoute?.id || '',
    type: 'LATE_BUS',
    title: '',
    description: '',
    location: '',
    priority: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedRoute) setFormData((p) => ({ ...p, routeId: selectedRoute.id }));
  }, [selectedRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      await axios.post(`${API_URL}/bus/emergency`, formData, {
        headers: { Authorization: `Bearer ${token?.trim()}` },
      });
      toast.success('Emergency reported. Help is on the way.');
      onClose();
    } catch { toast.error('Failed to send report.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5F5] flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-[#A51C30]" />
            </div>
            <h2 className="text-lg font-bold text-[#A51C30]">Emergency Report</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Route</label>
            <select
              value={formData.routeId}
              onChange={(e) => {
                const r = routes.find((x) => x.id === e.target.value);
                if (r) { onRouteSelect(r); setFormData({ ...formData, routeId: e.target.value }); }
              }}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A51C30]/20"
            >
              <option value="">Select Route</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.number})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Issue Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A51C30]/20"
            >
              {['LATE_BUS', 'ACCIDENT', 'BREAKDOWN', 'OVERCROWDED', 'DRIVER_ISSUE', 'SAFETY_CONCERN', 'OTHER'].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#A51C30]/20 resize-none"
              placeholder="What happened? Provide as much detail as possible."
              required
            />
          </div>
          <button
            disabled={submitting}
            type="submit"
            className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#A51C30] hover:bg-[#8b1526] disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Sending…' : 'Send Emergency Alert'}
          </button>
        </form>
      </div>
    </div>
  );
}
