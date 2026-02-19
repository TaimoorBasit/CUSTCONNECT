'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import ClipboardDocumentListIcon from '@heroicons/react/24/outline/ClipboardDocumentListIcon';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type TimeRange = 'day' | 'week' | 'month' | 'year' | 'custom';

export default function VendorAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [] as Array<{ name: string; quantity: number; revenue: number }>,
    ordersByStatus: {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    },
    recentOrders: [] as any[],
    revenueOverTime: [] as Array<{ date: string; amount: number }>
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      let params: any = { groupBy: 'day' }; // Default grouping

      const now = new Date();
      // Helper to get local start/end of day converted to ISO string
      const getStartOfDayISO = (d: Date) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
      };
      const getEndOfDayISO = (d: Date) => {
        const date = new Date(d);
        date.setHours(23, 59, 59, 999);
        return date.toISOString();
      };

      if (timeRange === 'day') {
        // Today
        params.startDate = getStartOfDayISO(now);
        params.endDate = getEndOfDayISO(now);
        params.groupBy = 'day';
      } else if (timeRange === 'week') {
        // Last 7 days
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 6); // 7 days inclusive of today
        params.startDate = getStartOfDayISO(lastWeek);
        params.endDate = getEndOfDayISO(now);
        params.groupBy = 'week';
      } else if (timeRange === 'month') {
        // This Month
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        params.startDate = getStartOfDayISO(firstDay);
        params.endDate = getEndOfDayISO(lastDay);
        params.groupBy = 'month';
      } else if (timeRange === 'year') {
        // This Year
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), 11, 31);
        params.startDate = getStartOfDayISO(firstDay);
        params.endDate = getEndOfDayISO(lastDay);
        params.groupBy = 'year';
      } else if (timeRange === 'custom' && customStartDate && customEndDate) {
        // Custom Range - Ensure we cover the full days (local time logic applied)
        // Since input type="date" returns YYYY-MM-DD, we need to treat it as local Date to get correct ISO
        const start = new Date(customStartDate);
        // Fix timezone offset issue when creating date from string (it defaults to UTC, but we want 00:00 local)
        // Actually, simple assumption: append T00:00:00 and let backend handle it, OR manually construct
        // Better: create date object and adjust
        const localStart = new Date(start.valueOf() + start.getTimezoneOffset() * 60000);
        localStart.setHours(0, 0, 0, 0);

        const end = new Date(customEndDate);
        const localEnd = new Date(end.valueOf() + end.getTimezoneOffset() * 60000);
        localEnd.setHours(23, 59, 59, 999);

        // Actually simpler: just append times if backend expects ISO
        params.startDate = new Date(customStartDate + 'T00:00:00').toISOString();
        params.endDate = new Date(customEndDate + 'T23:59:59.999').toISOString();

        // Auto-determine grouping based on range
        const diffTime = Math.abs(new Date(customEndDate).getTime() - new Date(customStartDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 365) params.groupBy = 'year';
        else if (diffDays > 31) params.groupBy = 'month';
        else params.groupBy = 'day';
      }

      // If custom is selected but dates aren't full, don't fetch yet or fetch default
      if (timeRange === 'custom' && (!customStartDate || !customEndDate)) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/vendor/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.message || 'Failed to load analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const getMaxRevenue = () => {
    if (!analytics.revenueOverTime.length) return 0;
    return Math.max(...analytics.revenueOverTime.map(d => d.amount));
  };

  const maxRevenue = getMaxRevenue();

  if (loading && !analytics.totalOrders) { // Only show full loader on initial load
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-sm text-gray-500">Track your earnings and performance</p>
              </div>
            </div>

            {/* Time Range Controls */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setTimeRange('day')}
                  className={`px-3 py-2 text-sm font-medium border rounded-l-md focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${timeRange === 'day' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-r-0 border-gray-300 hover:bg-gray-50'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeRange('week')}
                  className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${timeRange === 'week' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeRange('month')}
                  className={`px-3 py-2 text-sm font-medium border border-gray-300 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${timeRange === 'month' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-l-0 hover:bg-gray-50'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimeRange('year')}
                  className={`px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${timeRange === 'year' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Yearly
                </button>
                <button
                  onClick={() => setTimeRange('custom')}
                  className={`px-3 py-2 text-sm font-medium border rounded-r-md focus:z-10 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${timeRange === 'custom' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-l-0 border-gray-300 hover:bg-gray-50'}`}
                >
                  Custom
                </button>
              </div>

              {timeRange === 'custom' && (
                <div className="flex space-x-2 items-center">
                  <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-green-500">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Earning
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    PKR {analytics.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.totalOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.completedOrders}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-yellow-500">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Order Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    PKR {analytics.averageOrderValue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart (Simple CSS Bar Chart) */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Revenue Overview ({timeRange === 'month' ? 'Daily' : timeRange === 'year' ? 'Monthly' : timeRange === 'week' ? 'Daily' : timeRange === 'day' ? 'Today' : 'Custom Period'})
          </h3>

          {analytics.revenueOverTime.length > 0 ? (
            <div className="relative h-64 flex items-end space-x-2 border-b border-l border-gray-200 p-4">
              {analytics.revenueOverTime.map((item, index) => {
                const heightPercent = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div
                      className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-t transition-all duration-300 relative"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        PKR {item.amount.toFixed(0)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 transform -rotate-45 origin-top-left md:rotate-0 md:origin-center truncate w-full text-center">
                      {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No revenue data for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Revenue List / Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Top Selling Items
            </h3>
            {analytics.topSellingItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.topSellingItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">PKR {item.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No sales data available.</p>
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Orders
            </h3>
            {analytics.recentOrders.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {analytics.recentOrders.map((order) => (
                    <li key={order.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Order #{order.id.slice(-6)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            PKR {order.totalAmount.toFixed(2)}
                          </span>
                          <span className={`text-xs mt-1 ${order.status === 'COMPLETED' ? 'text-green-600' :
                            order.status === 'CANCELLED' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent orders.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
