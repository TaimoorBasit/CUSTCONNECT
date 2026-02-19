'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import BuildingStorefrontIcon from '@heroicons/react/24/outline/BuildingStorefrontIcon';
import MapIcon from '@heroicons/react/24/outline/MapIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import Link from 'next/link';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    cafes: 0,
    busRoutes: 0,
    totalViews: 0,
    activeDeals: 0,
  });

  const userRoles = user?.roles?.map(r => r.name) || [];
  const isCafeOwner = userRoles.includes('CAFE_OWNER');
  const isBusOperator = userRoles.includes('BUS_OPERATOR');

  useEffect(() => {
    // Fetch vendor stats
    // TODO: Implement API call
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to Vendor Portal, {user?.firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your {isCafeOwner ? 'cafés' : 'bus routes'} and track performance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isCafeOwner && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-md bg-yellow-500">
                      <BuildingStorefrontIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        My Cafés
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.cafes}
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
                    <div className="p-3 rounded-md bg-purple-500">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Deals
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.activeDeals}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {isBusOperator && (
          <>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-md bg-green-500">
                      <MapIcon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Bus Routes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.busRoutes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Views
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalViews}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isCafeOwner && (
              <Link
                href="/vendor/cafes"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                    <BuildingStorefrontIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Cafés</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Update menus, deals, and café information
                  </p>
                </div>
              </Link>
            )}

            {isBusOperator && (
              <Link
                href="/vendor/buses"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <MapIcon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">Manage Bus Routes</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Update schedules, drivers, and route information
                  </p>
                </div>
              </Link>
            )}

            <Link
              href="/vendor/analytics"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <ChartBarIcon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">View Analytics</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Track performance and engagement metrics
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

