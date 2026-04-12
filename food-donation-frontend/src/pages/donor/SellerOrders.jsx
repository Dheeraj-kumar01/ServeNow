import React, { useState, useEffect } from 'react';
import { getSellerOrders } from '../../services/food';
import { FaSpinner, FaRupeeSign, FaUser, FaPhone, FaMapMarkerAlt, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getSellerOrders();
      setOrders(data.orders || []);
      setStats(data.stats || {});
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: <FaHourglassHalf />, text: 'Pending Payment' };
      case 'accepted': return { color: 'bg-blue-100 text-blue-800', icon: <FaCheckCircle />, text: 'Accepted' };
      case 'completed': return { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle />, text: 'Delivered' };
      case 'rejected': return { color: 'bg-red-100 text-red-800', icon: <FaTimesCircle />, text: 'Rejected' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: null, text: status };
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-green-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.totalOrders || 0}</p><p className="text-sm text-gray-500">Total Orders</p></div>
          <div className="bg-white rounded-lg shadow p-4 text-center"><p className="text-2xl font-bold text-blue-600">₹{stats.totalRevenue || 0}</p><p className="text-sm text-gray-500">Total Earnings</p></div>
          <div className="bg-white rounded-lg shadow p-4 text-center"><p className="text-2xl font-bold text-orange-600">₹{stats.totalCommission || 0}</p><p className="text-sm text-gray-500">Commission</p></div>
          <div className="bg-white rounded-lg shadow p-4 text-center"><p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p><p className="text-sm text-gray-500">Pending</p></div>
          <div className="bg-white rounded-lg shadow p-4 text-center"><p className="text-2xl font-bold text-green-600">{stats.completedOrders || 0}</p><p className="text-sm text-gray-500">Completed</p></div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center"><p className="text-gray-500">No orders yet</p></div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusBadge = getStatusBadge(order.status);
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.food?.name}</h3>
                        <p className="text-sm text-gray-500">Order ID: {order._id.slice(-8)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusBadge.color}`}>
                        {statusBadge.icon}{statusBadge.text}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div><p className="text-sm text-gray-500">Buyer</p><p className="font-medium">{order.receiver?.name}</p><p className="text-sm">{order.receiver?.phone}</p></div>
                      <div><p className="text-sm text-gray-500">Amount</p><p className="font-medium text-green-600">₹{order.amount}</p><p className="text-xs text-gray-500">You earn: ₹{order.sellerEarning}</p></div>
                      <div><p className="text-sm text-gray-500">Ordered On</p><p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    
                    {order.status === 'accepted' && order.otp && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Delivery OTP: <span className="font-mono text-lg tracking-wider">{order.otp}</span></p>
                        <p className="text-xs text-blue-600">Share this OTP with buyer for delivery verification</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;