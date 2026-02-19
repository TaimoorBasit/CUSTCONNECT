'use client';

import { useState, useEffect } from 'react';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import { adminService } from '@/services/adminService';
import toast from 'react-hot-toast';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalCafes: 0,
    totalBusRoutes: 0,
    totalPosts: 0,
    totalEvents: 0,
    topSellingFoods: [],
    busiestBuses: [],
    postEngagement: {
      totalLikes: 0,
      totalComments: 0,
      averageEngagement: 0,
    },
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const analyticsData = await adminService.getAnalytics();
      setAnalytics({
        totalUsers: analyticsData.totalUsers || 0,
        totalVendors: analyticsData.totalVendors || 0,
        totalCafes: analyticsData.totalCafes || 0,
        totalBusRoutes: analyticsData.totalBusRoutes || 0,
        totalPosts: analyticsData.totalPosts || 0,
        totalEvents: analyticsData.totalEvents || 0,
        topSellingFoods: analyticsData.topSellingFoods || [],
        busiestBuses: analyticsData.busiestBuses || [],
        postEngagement: analyticsData.postEngagement || {
          totalLikes: 0,
          totalComments: 0,
          averageEngagement: 0,
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500">Platform statistics and insights.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-blue-500">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-purple-500">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Vendors</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalVendors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-indigo-500">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalPosts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-md bg-red-500">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Events</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalEvents}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cafés & Bus Routes</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Cafés</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalCafes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bus Routes</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.totalBusRoutes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Post Engagement</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Likes</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.postEngagement.totalLikes}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Comments</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.postEngagement.totalComments}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Engagement</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.postEngagement.averageEngagement}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Selling Foods */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Cafés by Menu Items</h3>
        <div className="space-y-2">
          {analytics.topSellingFoods.length === 0 ? (
            <p className="text-sm text-gray-500">No data available</p>
          ) : (
            analytics.topSellingFoods.map((food: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{food.name}</span>
                  {food.university && (
                    <span className="ml-2 text-xs text-gray-500">({food.university})</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{food.count} menu items</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Busiest Buses */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Busiest Bus Routes</h3>
        <div className="space-y-2">
          {analytics.busiestBuses.length === 0 ? (
            <p className="text-sm text-gray-500">No data available</p>
          ) : (
            analytics.busiestBuses.map((bus: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-900">{bus.name}</span>
                  {bus.university && (
                    <span className="ml-2 text-xs text-gray-500">({bus.university})</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{bus.subscribers} subscribers</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

