'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import axios from 'axios';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    notes?: string;
    menu: {
      id: string;
      name: string;
      price: number;
      category: string;
    };
  }>;
}

interface Cafe {
  id: string;
  name: string;
}

export default function VendorOrdersPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafeId, setSelectedCafeId] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCafes();
    // Also fetch orders directly (works even if cafe is deleted)
    fetchOrders();
  }, []);

  useEffect(() => {
    // Refetch orders when filter changes
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewOrder = (data: any) => {
      if (data.cafeId === selectedCafeId) {
        toast.success(`New order received: ${data.customerName}`);
        fetchOrders();
      }
    };

    const handleOrderCancelled = (data: any) => {
      if (data.cafeId === selectedCafeId) {
        toast.error('Order cancelled by customer');
        fetchOrders();
      }
    };

    socket.on('new-order', handleNewOrder);
    socket.on('order-cancelled', handleOrderCancelled);

    // Join cafe owner's room
    if (socket.connected) {
      socket.emit('join-room', user.id);
    } else {
      socket.once('connect', () => {
        socket.emit('join-room', user.id);
      });
    }

    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('order-cancelled', handleOrderCancelled);
    };
  }, [socket, user, selectedCafeId]);

  const fetchCafes = async () => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to continue');
        return;
      }

      // Use vendor endpoint to get assigned cafe (only one cafe per owner)
      const response = await axios.get(`${API_URL}/vendor/cafe`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
        timeout: 15000, // 15 second timeout
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        console.error('❌ Authentication failed - token expired or invalid');
        localStorage.removeItem('cc_token');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return;
      }

      // Handle 404 - no cafe assigned
      if (response.status === 404) {
        // No cafe assigned - this is expected for new cafe owners
        setCafes([]);
        return;
      }

      if (response.data.success && response.data.cafe) {
        const cafe = response.data.cafe;
        setCafes([cafe]);
        if (!selectedCafeId) {
          setSelectedCafeId(cafe.id);
        }
      } else {
        setCafes([]);
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch cafe:', error);

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        console.error('❌ Network error - backend server may be down', error);
        // Try to ping the backend first
        try {
          const pingResponse = await axios.get(`${API_URL.replace('/api', '')}/api/ping`, {
            timeout: 5000
          });
          if (pingResponse.data.success) {
            // Backend is up, but vendor endpoint failed - retry once
            console.log('Backend is up, retrying vendor cafe fetch...');
            setTimeout(() => fetchCafes(), 1000);
            return;
          }
        } catch (pingError) {
          console.error('Backend ping failed:', pingError);
        }
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else if (error.response?.status === 404) {
        // No cafe assigned - this is expected for new cafe owners
        setCafes([]);
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
        setCafes([]);
      } else if (error.response?.status === 401) {
        console.error('❌ Authentication failed');
        localStorage.removeItem('cc_token');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      } else {
        console.error('❌ Error fetching cafe:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to load cafe');
        setCafes([]);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');

      if (!token) {
        toast.error('Please login to continue');
        setLoading(false);
        return;
      }

      // Use vendor endpoint to get orders (works even if cafe is deleted)
      const response = await axios.get(
        `${API_URL}/orders/vendor?status=${statusFilter === 'all' ? '' : statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token.trim()}` },
          timeout: 15000, // 15 second timeout
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        }
      );

      if (response.data.success) {
        setOrders(response.data.orders || []);

        // If we have orders but no cafe selected, try to get cafe info from orders
        if (response.data.orders && response.data.orders.length > 0 && !selectedCafeId) {
          const firstOrder = response.data.orders[0];
          if (firstOrder.cafeId) {
            setSelectedCafeId(firstOrder.cafeId);
            // Try to fetch cafe info
            try {
              const cafeResponse = await axios.get(`${API_URL}/vendor/cafe`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (cafeResponse.data.success && cafeResponse.data.cafe) {
                setCafes([cafeResponse.data.cafe]);
              } else {
                // Cafe deleted but orders exist - create a placeholder
                setCafes([{
                  id: firstOrder.cafeId,
                  name: firstOrder.cafe?.name || 'Deleted Cafe'
                }]);
              }
            } catch {
              // Cafe deleted but orders exist - create a placeholder
              setCafes([{
                id: firstOrder.cafeId,
                name: firstOrder.cafe?.name || 'Deleted Cafe'
              }]);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch orders:', error);

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
        console.error('❌ Network error - backend server may be down', error);
        // Try to ping the backend first
        try {
          const pingResponse = await axios.get(`${API_URL.replace('/api', '')}/api/ping`, {
            timeout: 5000
          });
          if (pingResponse.data.success) {
            // Backend is up, but orders endpoint failed - retry once
            console.log('Backend is up, retrying orders fetch...');
            setTimeout(() => fetchOrders(), 1000);
            return;
          }
        } catch (pingError) {
          console.error('Backend ping failed:', pingError);
        }
        toast.error('Cannot connect to server. Please check if the backend is running.');
      } else if (error.response?.status === 404) {
        // No orders found - this is okay
        setOrders([]);
      } else if (error.response?.status === 401) {
        console.error('❌ Authentication failed');
        localStorage.removeItem('cc_token');
        localStorage.removeItem('token');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      } else {
        console.error('❌ Error fetching orders:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('cc_token') || localStorage.getItem('token');
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Order status updated');
      fetchOrders();
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (cafes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">You don't own any cafes yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      </div>

      {/* Cafe Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Cafe
        </label>
        <select
          value={selectedCafeId}
          onChange={(e) => setSelectedCafeId(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {cafes.map((cafe) => (
            <option key={cafe.id} value={cafe.id}>
              {cafe.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Customer: {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {order.user.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Placed: {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    PKR {Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Items:</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{item.menu.name}</span>
                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                        {item.notes && (
                          <p className="text-xs text-gray-600 mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <span className="text-gray-900 font-semibold">
                        PKR {(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                {order.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold text-gray-900">Special Instructions:</span> <span className="text-gray-800">{order.notes}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
              <div className="flex gap-2 flex-wrap">
                {order.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Cancel Order
                    </button>
                  </>
                )}
                {order.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'READY')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Mark as Ready
                  </button>
                )}
                {order.status === 'READY' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Complete Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

