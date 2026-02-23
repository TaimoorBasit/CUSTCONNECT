'use client';

import { useState, useEffect } from 'react';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import ShoppingBagIcon from '@heroicons/react/24/outline/ShoppingBagIcon';
import ChatBubbleLeftRightIcon from '@heroicons/react/24/outline/ChatBubbleLeftRightIcon';
import CalendarDaysIcon from '@heroicons/react/24/outline/CalendarDaysIcon';
import FireIcon from '@heroicons/react/24/outline/FireIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import ArrowUpRightIcon from '@heroicons/react/24/outline/ArrowUpRightIcon';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 border-2 border-[#A51C30] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Computing platform metrics…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">

      {/* Clean page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 md:px-10 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1a2744] flex items-center justify-center flex-shrink-0 shadow-sm">
              <ChartBarIcon className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a2744] tracking-tight">Analytics</h1>
              <p className="text-sm text-gray-400 mt-0.5">Platform growth, engagement, and service metrics</p>
            </div>
          </div>
          <div className="flex-shrink-0 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-500">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-10 pb-12 space-y-8">

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'Total Citizens', value: analytics.totalUsers, icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-500/10', gradient: 'from-blue-500/20 to-transparent' },
            { name: 'Active Vendors', value: analytics.totalVendors, icon: ShoppingBagIcon, color: 'text-purple-500', bg: 'bg-purple-500/10', gradient: 'from-purple-500/20 to-transparent' },
            { name: 'Social Pulse', value: analytics.totalPosts, icon: ChatBubbleLeftRightIcon, color: 'text-indigo-500', bg: 'bg-indigo-500/10', gradient: 'from-indigo-500/20 to-transparent' },
            { name: 'Event Reach', value: analytics.totalEvents, icon: CalendarDaysIcon, color: 'text-pink-500', bg: 'bg-pink-500/10', gradient: 'from-pink-500/20 to-transparent' },
          ].map((stat) => (
            <div key={stat.name} className="group relative overflow-hidden bg-white rounded-[24px] border border-gray-100 p-6 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.gradient} -m-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className={`inline-flex p-4 rounded-2xl ${stat.bg} ${stat.color} mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300`}>
                <stat.icon className="w-8 h-8 stroke-[2.5]" />
              </div>

              <dt className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.name}</dt>
              <dd className="text-3xl font-black tracking-tighter text-gray-900 flex items-baseline gap-2">
                {stat.value.toLocaleString()}
                <span className="text-emerald-500 text-sm font-bold flex items-center">
                  <ArrowUpRightIcon className="w-3 h-3" />
                  Live
                </span>
              </dd>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Advanced Engagement Analytics */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">Social Engagement</h3>
              <div className="p-2 bg-indigo-50 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-500" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Likes</p>
                <p className="text-3xl font-black text-gray-900">{analytics.postEngagement.totalLikes.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Comments</p>
                <p className="text-3xl font-black text-gray-900">{analytics.postEngagement.totalComments.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Rate</p>
                <p className="text-3xl font-black text-indigo-600">{analytics.postEngagement.averageEngagement}%</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full w-3/4" />
              </div>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Platform Engagement Velocity</p>
            </div>
          </div>

          {/* Service Density Statistics */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">Service Infrastructure</h3>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <ChartBarIcon className="w-5 h-5 text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="p-6 bg-gray-50 rounded-[24px] space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Cafés</p>
                <p className="text-4xl font-black text-gray-900">{analytics.totalCafes}</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-[24px] space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Routes</p>
                <p className="text-4xl font-black text-gray-900">{analytics.totalBusRoutes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Top Performing Cafés */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-orange-50 rounded-xl">
                <FireIcon className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">Market Leaders</h3>
            </div>

            <div className="space-y-4">
              {analytics.topSellingFoods.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">Data synchronization in progress...</p>
                </div>
              ) : (
                analytics.topSellingFoods.map((cafe: any, index: number) => (
                  <div key={index} className="group flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-orange-200 hover:bg-white transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block group-hover:text-orange-600 transition-colors uppercase tracking-tight">{cafe.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cafe.university}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">{cafe.count} ITEMS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* High-Traffic Transport Routes */}
          <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <MapPinIcon className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-gray-900 uppercase">Transit Velocity</h3>
            </div>

            <div className="space-y-4">
              {analytics.busiestBuses.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest italic">Network analysis pending...</p>
                </div>
              ) : (
                analytics.busiestBuses.map((bus: any, index: number) => (
                  <div key={index} className="group flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-blue-200 hover:bg-white transition-all cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-black text-gray-900 block group-hover:text-blue-600 transition-colors uppercase tracking-tight">{bus.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{bus.university}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">{bus.subscribers} SUBS</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

