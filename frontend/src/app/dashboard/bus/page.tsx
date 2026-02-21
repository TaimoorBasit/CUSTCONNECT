'use client';

import { useState, useEffect } from 'react';
import {
  MapIcon,
  MegaphoneIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import toast from 'react-hot-toast';
import { userService } from '@/services/userService';
import { UserPlusIcon } from '@heroicons/react/24/outline';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface BusRoute {
  id: string;
  name: string;
  number: string;
  busNumber?: string;
  driverContactNumber?: string;
  description?: string;
  isActive: boolean;
  schedules: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  operator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }>;
}

export default function BusServicePage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [selectedRouteForEmergency, setSelectedRouteForEmergency] = useState<BusRoute | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bus/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setRoutes(response.data.routes || []);
      }
    } catch (error: any) {
      console.error('Error fetching bus routes:', error);
      toast.error('Failed to load bus routes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getTodaySchedules = (schedules: BusRoute['schedules']) => {
    const today = new Date().getDay();
    return schedules.filter(s => s.dayOfWeek === today);
  };

  if (loading) return <div className="flex h-96 items-center justify-center text-muted-foreground animate-pulse">Loading bus routes...</div>;

  const allNotifications = routes.flatMap(route =>
    route.notifications.map(notif => ({ ...notif, routeName: route.name }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bus Service</h1>
          <p className="text-muted-foreground mt-1 text-lg">Track campus routes, statuses, and live alerts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMapModal(true)}
            className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all"
          >
            <MapIcon className="mr-2 h-5 w-5" /> View Network Map
          </button>
          <button
            onClick={() => {
              if (routes.length > 0) {
                setSelectedRouteForEmergency(routes[0]);
                setShowEmergencyModal(true);
              } else {
                toast.error('No routes available');
              }
            }}
            className="inline-flex items-center rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20 animate-pulse hover:animate-none transition-all"
          >
            <ExclamationTriangleIcon className="mr-2 h-5 w-5" /> SOS / Emergency
          </button>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center bg-card/50">
          <MapIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-sm font-semibold text-foreground">No active routes</h3>
          <p className="mt-1 text-sm text-muted-foreground">Bus routes will appear here when scheduled.</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {routes.map((route) => {
                const todaySchedules = getTodaySchedules(route.schedules);
                return (
                  <div key={route.id} className="group relative rounded-3xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-all hover:border-primary/20">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">Route {route.number}</span>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${route.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>
                            {route.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">{route.name}</h3>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Bus Number</p>
                          <p className="text-sm font-semibold text-foreground">{route.busNumber || 'N/A'}</p>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Driver</p>
                          {route.driverContactNumber ? (
                            <a href={`tel:${route.driverContactNumber}`} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                              <PhoneIcon className="h-3 w-3" /> {route.driverContactNumber}
                            </a>
                          ) : <span className="text-sm text-muted-foreground">N/A</span>}
                        </div>
                      </div>
                      {route.description && <p className="text-sm text-muted-foreground bg-secondary/20 p-3 rounded-xl">{route.description}</p>}
                    </div>

                    <div className="border-t border-border/50 pt-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Today's Schedule</p>
                      {todaySchedules.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {todaySchedules.map((s) => (
                            <span key={s.id} className="bg-secondary text-foreground text-xs font-medium px-3 py-1.5 rounded-lg border border-border/50">
                              {s.startTime} - {s.endTime}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No trips scheduled for today</p>
                      )}
                    </div>

                    {route.operator && (
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await userService.followUser(route.operator!.id);
                              toast.success(`Following ${route.operator!.firstName}`);
                            } catch (err) {
                              toast.error('Failed to follow');
                            }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform"
                          title="Follow Operator"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                        </button>
                        <a href={`/dashboard/messages?userId=${route.operator.id}`} className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:scale-110 transition-transform" title="Message Operator">
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Alerts Sidebar */}
          {allNotifications.length > 0 && (
            <div className="w-full lg:w-80 space-y-4">
              <div className="bg-destructive/5 rounded-3xl border border-destructive/10 p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"><MegaphoneIcon className="h-4 w-4" /></div>
                  <h3 className="font-bold text-destructive">Live Alerts</h3>
                </div>
                <div className="space-y-3">
                  {allNotifications.slice(0, 5).map(alert => (
                    <div key={alert.id} className="bg-white p-4 rounded-xl shadow-sm border border-destructive/10">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-bold text-sm text-foreground">{alert.title}</p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{formatDate(alert.createdAt)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed"><span className="font-bold text-destructive">{alert.routeName}:</span> {alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && <RouteMapModal routes={routes} onClose={() => setShowMapModal(false)} />}
      {/* Emergency Modal */}
      {showEmergencyModal && <EmergencyModal routes={routes} selectedRoute={selectedRouteForEmergency} onClose={() => { setShowEmergencyModal(false); setSelectedRouteForEmergency(null); }} onRouteSelect={setSelectedRouteForEmergency} />}
    </div>
  );
}

function RouteMapModal({ routes, onClose }: { routes: BusRoute[]; onClose: () => void }) {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(routes[0] || null);

  const openGoogleMaps = (route: BusRoute) => {
    const searchQuery = encodeURIComponent(`${route.name} bus route`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[80vh] bg-card rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-2xl font-bold text-foreground">Bus Route Map</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full text-muted-foreground hover:text-foreground"><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 bg-secondary/30 border-r border-border/50 overflow-y-auto p-4 space-y-2">
            {routes.map(route => (
              <div key={route.id} onClick={() => setSelectedRoute(route)} className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedRoute?.id === route.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border hover:border-primary/30'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className={`font-bold text-sm ${selectedRoute?.id === route.id ? 'text-primary' : 'text-foreground'}`}>{route.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">Route {route.number}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${route.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>{route.isActive ? 'Active' : 'Stopped'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center bg-secondary/10">
            {selectedRoute ? (
              <div className="text-center space-y-6 max-w-md">
                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary"><MapIcon className="h-10 w-10" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedRoute.name}</h3>
                  <p className="text-muted-foreground mt-2">{selectedRoute.description || 'Campus Loop Route'}</p>
                </div>
                <button onClick={() => openGoogleMaps(selectedRoute)} className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  Open in Google Maps
                </button>
              </div>
            ) : <p className="text-muted-foreground">Select a route</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmergencyModal({ routes, selectedRoute, onClose, onRouteSelect }: { routes: BusRoute[]; selectedRoute: BusRoute | null; onClose: () => void; onRouteSelect: (route: BusRoute) => void }) {
  const [formData, setFormData] = useState({ routeId: selectedRoute?.id || '', type: 'LATE_BUS', title: '', description: '', location: '', priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (selectedRoute) setFormData(prev => ({ ...prev, routeId: selectedRoute.id })); }, [selectedRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/bus/emergency`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Report sent. Help is on the way.');
      onClose();
    } catch { toast.error('Failed to report.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl border border-destructive/20 p-8 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-destructive flex items-center gap-2"><ExclamationTriangleIcon className="h-7 w-7" /> Emergency Report</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full"><XMarkIcon className="h-6 w-6 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground uppercase mb-1 block">Route</label>
            <select value={formData.routeId} onChange={(e) => { const r = routes.find(x => x.id === e.target.value); if (r) { onRouteSelect(r); setFormData({ ...formData, routeId: e.target.value }); } }} className="w-full bg-secondary border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-destructive/20">
              <option value="">Select Route</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.number})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground uppercase mb-1 block">Issue Type</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-secondary border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-destructive/20">
              {['LATE_BUS', 'ACCIDENT', 'BREAKDOWN', 'OVERCROWDED', 'DRIVER_ISSUE', 'SAFETY_CONCERN', 'OTHER'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground uppercase mb-1 block">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full bg-secondary border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-destructive/20 resize-none" placeholder="What happened?" required />
          </div>
          <button disabled={submitting} type="submit" className="w-full py-3 bg-destructive text-destructive-foreground font-bold rounded-xl shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-all">{submitting ? 'Sending...' : 'Send Emergency Alert'}</button>
        </form>
      </div>
    </div>
  );
}
