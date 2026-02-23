'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ExclamationTriangleIcon from '@heroicons/react/24/solid/ExclamationTriangleIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import ClockIcon from '@heroicons/react/24/solid/ClockIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import UserIcon from '@heroicons/react/24/outline/UserIcon';
import TruckIcon from '@heroicons/react/24/outline/TruckIcon';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Emergency {
  id: string;
  type: string;
  title: string;
  description: string;
  location?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  route: {
    id: string;
    name: string;
    number: string;
    busNumber?: string;
    driverContactNumber?: string;
  };
  resolvedByUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function EmergencyReportsPage() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });

  useEffect(() => {
    fetchEmergencies();
  }, [filterStatus, filterPriority]);

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;

      const response = await axios.get(`${API_URL}/bus/emergencies`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setEmergencies(response.data.emergencies || []);
      }
    } catch (error: any) {
      toast.error('Failed to load emergency telemetry');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedEmergency || !statusUpdate.status) {
      toast.error('Authorization required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/bus/emergencies/${selectedEmergency.id}/status`,
        statusUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Incident record updated');
        setShowStatusModal(false);
        setSelectedEmergency(null);
        setStatusUpdate({ status: '', notes: '' });
        fetchEmergencies();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transmission failure');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-rose-500 text-white shadow-lg shadow-rose-500/20';
      case 'HIGH': return 'bg-orange-500 text-white shadow-lg shadow-orange-500/20';
      case 'MEDIUM': return 'bg-amber-500 text-white';
      case 'LOW': return 'bg-indigo-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PENDING': return 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse';
      case 'DISMISSED': return 'bg-gray-50 text-gray-400 border-gray-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'LATE_BUS': 'Schedule Derailment',
      'ACCIDENT': 'Collision Event',
      'BREAKDOWN': 'Mechanical Failure',
      'OVERCROWDED': 'Capacity Overflow',
      'DRIVER_ISSUE': 'Personnel Anomaly',
      'SAFETY_CONCERN': 'Security Threat',
      'OTHER': 'Unclassified Incident'
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && emergencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse text-xs uppercase tracking-widest text-rose-500">Scanning incident channels...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-8 md:p-12 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Crisis Command Center
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Incident <span className="text-rose-400">Response</span>
            </h1>
            <p className="text-slate-300 font-medium max-w-xl leading-relaxed">
              Real-time synchronization with faculty and student transport distress signals. Prioritize and neutralize operational hazards efficiently.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Live Feed</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                <p className="text-white font-black text-sm uppercase">Active Channel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Stats & Filter */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Incident Volume', value: emergencies.length, color: 'text-indigo-600', icon: InformationCircleIcon, bg: 'bg-indigo-50' },
            { label: 'Awaiting Action', value: emergencies.filter(e => e.status === 'PENDING').length, color: 'text-rose-600', icon: ExclamationTriangleIcon, bg: 'bg-rose-50' },
            { label: 'In Operation', value: emergencies.filter(e => e.status === 'IN_PROGRESS').length, color: 'text-blue-600', icon: ClockIcon, bg: 'bg-blue-50' },
            { label: 'Neutralized', value: emergencies.filter(e => e.status === 'RESOLVED').length, color: 'text-emerald-600', icon: CheckCircleIcon, bg: 'bg-emerald-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Protocol Filters</p>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-5 py-3 text-[11px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer uppercase tracking-widest"
          >
            <option value="all">Every State</option>
            <option value="PENDING">Critical Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved Only</option>
            <option value="DISMISSED">Dismissed Records</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-5 py-3 text-[11px] font-black text-gray-900 outline-none focus:ring-4 focus:ring-indigo-500/10 cursor-pointer uppercase tracking-widest"
          >
            <option value="all">All Threat Levels</option>
            <option value="CRITICAL">Class-A Critical</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Standard Risk</option>
            <option value="LOW">Minor Alerts</option>
          </select>
        </div>
      </div>

      {/* Emergency List */}
      {emergencies.length === 0 ? (
        <div className="bg-white rounded-[40px] p-32 text-center border border-dashed border-gray-200 shadow-inner">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <ShieldCheckIcon className="h-10 w-10 stroke-[2]" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Zero Active Hazards</h3>
          <p className="text-gray-400 font-medium max-w-sm mx-auto">All logistical channels are clear. No distress signals detected in current sector.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {emergencies.map((emergency) => (
            <div key={emergency.id} className="group relative bg-white rounded-[40px] border border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:border-black/5 flex flex-col overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-50/50 to-transparent -mr-8 -mt-8 rounded-full"></div>

              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] ${getPriorityColor(emergency.priority)}`}>
                      {emergency.priority} LEVEL
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusColor(emergency.status)}`}>
                      {emergency.status}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-rose-600 transition-colors uppercase leading-none">{emergency.title}</h3>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{getTypeLabel(emergency.type)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-300 uppercase underline decoration-rose-500/30 underline-offset-4 mb-2">TIMESTAMP</p>
                  <p className="text-xs font-black text-gray-900">{formatDate(emergency.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <TruckIcon className="w-4 h-4 text-indigo-500" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Transport Delta</p>
                  </div>
                  <p className="text-sm font-black text-gray-900 uppercase">Route {emergency.route.number}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-tight truncate">{emergency.route.name}</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100 group-hover:bg-white transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <UserIcon className="w-4 h-4 text-rose-500" />
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Origin Agent</p>
                  </div>
                  <p className="text-sm font-black text-gray-900 truncate">{emergency.user.firstName} {emergency.user.lastName}</p>
                  <p className="text-[10px] font-bold text-gray-500 underline underline-offset-2">{emergency.user.email}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-3xl mb-8 relative">
                <div className="absolute top-4 right-6 opacity-10">
                  <InformationCircleIcon className="w-12 h-12 text-white" />
                </div>
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mb-3">Intelligence Feed</p>
                <p className="text-sm text-slate-300 leading-relaxed font-bold italic">"{emergency.description}"</p>
                {emergency.location && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-rose-500" />
                    <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{emergency.location}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedEmergency(emergency);
                  setStatusUpdate({ status: emergency.status, notes: emergency.notes || '' });
                  setShowStatusModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-5 rounded-[24px] bg-black text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:bg-rose-600 active:scale-95 transition-all outline-none"
              >
                INITIALIZE COMMAND
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedEmergency && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-12">
            <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl" onClick={() => setShowStatusModal(false)} />
            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20 text-gray-900">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>

              <div className="flex items-center justify-between p-8 md:p-10 border-b border-gray-50">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Update Incident Payload</h2>
                  <p className="text-gray-400 font-medium italic text-xs tracking-wide">Incident ID: {selectedEmergency.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:scale-110 transition-all"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Deployment Status *</label>
                    <div className="relative">
                      <select
                        value={statusUpdate.status}
                        onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full rounded-2xl bg-gray-50 border border-gray-100 px-6 py-4 font-black text-gray-900 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all appearance-none cursor-pointer uppercase tracking-widest"
                      >
                        <option value="PENDING">PENDING ALERT</option>
                        <option value="IN_PROGRESS">ACTIVE DEPLOYMENT</option>
                        <option value="RESOLVED">NEUTRALIZED / RESOLVED</option>
                        <option value="DISMISSED">FALSE ALARM / DISMISSED</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                        <ClockIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Resolution Intelligence</label>
                    <textarea
                      value={statusUpdate.notes}
                      onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full rounded-3xl bg-gray-50 border border-gray-100 px-6 py-5 font-bold text-gray-700 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all placeholder:text-gray-300 resize-none"
                      placeholder="Input final action report, rescue logistics, or dismissal reasoning..."
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-[24px] font-black hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-[0.98] uppercase tracking-widest text-xs outline-none"
                  >
                    ABORT
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-[2] py-5 bg-rose-600 text-white rounded-[24px] font-black shadow-xl shadow-rose-600/20 hover:bg-black active:scale-[0.98] transition-all uppercase tracking-widest text-xs outline-none"
                  >
                    SYNC PROTOCOL
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





