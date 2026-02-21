'use client';

import { useState, useEffect } from 'react';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
import ShieldCheckIcon from '@heroicons/react/24/outline/ShieldCheckIcon';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import FingerPrintIcon from '@heroicons/react/24/outline/FingerPrintIcon';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  details: string;
  timestamp: string;
  createdAt?: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [filter, entityFilter, dateFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const logs = await adminService.getAuditLogs(
        undefined,
        1000,
        undefined,
        undefined
      );

      const mappedLogs = logs.map((log: any) => ({
        ...log,
        timestamp: log.createdAt || log.timestamp,
        id: log.id || Math.random().toString(),
        action: log.action || 'UNKNOWN',
        entityType: log.entityType || 'UNKNOWN',
        entityId: log.entityId || '',
        userId: log.userId || '',
        userEmail: log.userEmail || 'Unknown',
        details: log.details || '{}'
      }));

      setLogs(mappedLogs);
      setLoading(false);
    } catch (error: any) {
      toast.error('Failed to synchronize security registers');
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-500 text-white';
      case 'UPDATE': return 'bg-indigo-500 text-white';
      case 'DELETE': return 'bg-rose-500 text-white shadow-lg shadow-rose-500/20';
      case 'ROLE_ASSIGN':
      case 'ROLE_REMOVE': return 'bg-violet-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'CREATE': 'Provisioned',
      'UPDATE': 'Modified',
      'DELETE': 'Terminated',
      'ROLE_ASSIGN': 'Permission Accession',
      'ROLE_REMOVE': 'Permission Revocation'
    };
    return labels[action] || action;
  };

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch {
      return { raw: details };
    }
  };

  const formatDetails = (details: string) => {
    const parsed = parseDetails(details);
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join(', ');
    }
    return details;
  };

  const exportLogs = () => {
    const csv = [
      ['ID', 'Action', 'Entity Type', 'Entity ID', 'User Email', 'Details', 'Timestamp'].join(','),
      ...logs.map(log => [
        log.id,
        log.action,
        log.entityType,
        log.entityId,
        log.userEmail,
        `"${formatDetails(log.details).replace(/"/g, '""')}"`,
        new Date(log.timestamp).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custconnect-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Security manifest exported');
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.action !== filter) return false;
    if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.userEmail.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        formatDetails(log.details).toLowerCase().includes(query)
      );
    }
    return true;
  });

  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entityType)));

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse text-xs uppercase tracking-widest">Accessing encrypted archives...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-[#020617] to-[#1e1b4b] p-8 md:p-12 shadow-2xl transition-all duration-700">
        <div className="absolute top-0 right-0 -m-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -m-12 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Governance & Security
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              System <span className="text-indigo-400">Ledger</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
              Consolidated immutable records of administrative operations. Trace every modification to maintain the platform's integrity.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchLogs}
              className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-[20px] font-black border border-white/10 transition-all active:scale-95 flex items-center gap-2 uppercase text-[10px] tracking-widest"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Resync Archives
            </button>
            <button
              onClick={exportLogs}
              className="px-8 py-4 bg-indigo-600 hover:bg-black text-white rounded-[20px] font-black shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 uppercase text-[10px] tracking-widest"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Intelligence Export
            </button>
          </div>
        </div>
      </div>

      {/* Modernized Filters */}
      <div className="bg-white rounded-[32px] p-6 lg:p-8 border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-6">
        <div className="flex-[2] relative group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Global Query</label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by agent, target, or operation..."
              className="w-full rounded-2xl bg-gray-50 border border-transparent px-14 py-4 font-bold text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-gray-300 placeholder:font-medium"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Operation Protocol</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-2xl bg-gray-50 border border-transparent px-6 py-4 font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-pointer appearance-none uppercase text-[10px] tracking-widest"
          >
            <option value="all">Every Action</option>
            <option value="CREATE">Creation Protocol</option>
            <option value="UPDATE">Update Protocol</option>
            <option value="DELETE">Deletion Protocol</option>
            <option value="ROLE_ASSIGN">Accession Grant</option>
            <option value="ROLE_REMOVE">Accession Denial</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">Target Entity</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="w-full rounded-2xl bg-gray-50 border border-transparent px-6 py-4 font-black text-gray-900 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-pointer appearance-none uppercase text-[10px] tracking-widest"
          >
            <option value="all">All Modules</option>
            {uniqueEntityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Display */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-[40px] p-32 text-center border border-dashed border-gray-100">
            <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-8 text-indigo-400">
              <FingerPrintIcon className="h-12 w-12 stroke-[1.5]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Null Sector Detected</h3>
            <p className="text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">No administrative activity matches the filtered query parameters.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              onClick={() => {
                setSelectedLog(log);
                setShowDetailsModal(true);
              }}
              className="group bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-black/5 transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center gap-6"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-tight shadow-sm ${getActionColor(log.action)}`}>
                  {log.action.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-black text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{log.entityType}</span>
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.1em]">
                      TOKEN: {log.entityId.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-black text-gray-500 uppercase">{log.userEmail}</p>
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wide">{new Date(log.timestamp).toLocaleString().toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 md:px-6">
                <p className="text-xs font-bold text-gray-400 line-clamp-1 italic bg-gray-50/50 px-4 py-2 rounded-xl group-hover:bg-white transition-colors">
                  {formatDetails(log.details)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all block">
                  INSPECT LOG →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-12">
            <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setShowDetailsModal(false)} />
            <div className="relative bg-white rounded-[40px] shadow-2xl max-w-4xl w-full overflow-hidden border border-white/20 text-gray-900">
              <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

              <div className="flex items-center justify-between p-8 md:p-10 border-b border-gray-50">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Archive Penetration</h2>
                  <p className="text-gray-400 font-medium italic text-xs tracking-wide">Ledger Entry: {selectedLog.id.toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 hover:scale-110 transition-all outline-none"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operation</p>
                    <p className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getActionColor(selectedLog.action)}`}>
                      {getActionLabel(selectedLog.action)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Type</p>
                    <p className="text-sm font-black text-gray-900 uppercase">{selectedLog.entityType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Index</p>
                    <p className="text-sm font-mono font-black text-gray-900">{selectedLog.entityId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Executing Agent</p>
                    <p className="text-sm font-black text-gray-900">{selectedLog.userEmail}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Anchor</p>
                    <p className="text-sm font-black text-gray-900 uppercase">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payload Analysis</p>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Valid Integrity</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <pre className="relative bg-slate-900 p-8 rounded-[32px] text-[13px] text-indigo-300 font-bold overflow-auto max-h-[400px] border border-white/5 scrollbar-hide shadow-inner leading-relaxed">
                      {JSON.stringify(parseDetails(selectedLog.details), null, 4)}
                    </pre>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-10 py-5 bg-black text-white rounded-[24px] font-black hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    CLOSE ANALYSIS
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

