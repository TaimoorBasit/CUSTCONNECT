'use client';

import { useState, useEffect } from 'react';
import DocumentTextIcon from '@heroicons/react/24/outline/DocumentTextIcon';
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon';
import FunnelIcon from '@heroicons/react/24/outline/FunnelIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import ArrowPathIcon from '@heroicons/react/24/outline/ArrowPathIcon';
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

  // Also fetch when search query changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is handled client-side, no need to refetch
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Always fetch all logs first, then filter client-side for better UX
      const logs = await adminService.getAuditLogs(
        undefined, // Don't filter by action on backend - do it client-side
        1000, // Get more logs
        undefined, // Don't filter by entity type on backend
        undefined // Don't filter by date on backend - do it client-side
      );
      
      console.log('Fetched audit logs:', logs.length, logs);
      
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
      
      if (mappedLogs.length === 0) {
        console.warn('No audit logs found in database. Perform some admin actions to generate logs.');
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Audit log error:', error);
      toast.error('Failed to load audit logs: ' + (error.message || 'Unknown error'));
      setLogs([]);
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'ROLE_ASSIGN':
      case 'ROLE_REMOVE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'ROLE_ASSIGN':
        return '👤';
      case 'ROLE_REMOVE':
        return '➖';
      default:
        return '📝';
    }
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
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit logs exported successfully');
  };

  const filteredLogs = logs.filter(log => {
    // Filter by action
    if (filter !== 'all' && log.action !== filter) return false;
    
    // Filter by entity type
    if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
    
    // Filter by search query
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

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'today': {
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        return today;
      }
      case 'week': {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo;
      }
      default:
        return null;
    }
  };

  const dateFilteredLogs = dateFilter !== 'all' 
    ? filteredLogs.filter(log => {
        try {
          const logDate = new Date(log.timestamp);
          const rangeStart = getDateRange();
          if (!rangeStart) return true;
          return logDate >= rangeStart;
        } catch (e) {
          return true; // Include if date parsing fails
        }
      })
    : filteredLogs;

  const uniqueEntityTypes = Array.from(new Set(logs.map(log => log.entityType)));

  if (loading) {
    return <div className="text-center py-12 text-gray-900">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Review all admin actions and system changes.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            title="Refresh logs"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportLogs}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="ROLE_ASSIGN">Role Assign</option>
              <option value="ROLE_REMOVE">Role Remove</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {uniqueEntityTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Logs</dt>
                  <dd className="text-lg font-medium text-gray-900">{dateFilteredLogs.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">➕</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Creates</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dateFilteredLogs.filter(l => l.action === 'CREATE').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">✏️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Updates</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dateFilteredLogs.filter(l => l.action === 'UPDATE').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">🗑️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Deletes</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {dateFilteredLogs.filter(l => l.action === 'DELETE').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{dateFilteredLogs.length}</span> of <span className="font-medium">{logs.length}</span> logs
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {dateFilteredLogs.length === 0 ? (
            <li className="px-4 py-8 text-center text-gray-500">
              No audit logs found matching your filters
            </li>
          ) : (
            dateFilteredLogs.map((log) => {
              const details = parseDetails(log.details);
              return (
                <li 
                  key={log.id} 
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedLog(log);
                    setShowDetailsModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {log.entityType}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          ID: {log.entityId.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {typeof details === 'object' && details !== null
                          ? Object.entries(details).slice(0, 3).map(([key, value]) => (
                              <span key={key} className="mr-4">
                                <span className="font-medium">{key}:</span>{' '}
                                <span className="text-gray-500">
                                  {typeof value === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50)}
                                </span>
                              </span>
                            ))
                          : formatDetails(log.details).substring(0, 150)}
                        {formatDetails(log.details).length > 150 && '...'}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span>👤 {log.userEmail}</span>
                        <span>🕐 {new Date(log.timestamp).toLocaleString()}</span>
                        <span className="text-blue-600 hover:text-blue-800">View Details →</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDetailsModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Audit Log Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                        {selectedLog.action}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entity Type</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.entityType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entity ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.entityId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Log ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.id}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                  <pre className="bg-gray-50 p-4 rounded-md text-xs text-gray-800 overflow-auto max-h-96">
                    {JSON.stringify(parseDetails(selectedLog.details), null, 2)}
                  </pre>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

