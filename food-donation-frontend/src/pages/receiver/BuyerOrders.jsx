import React, { useState, useEffect } from 'react';
import { getReceiverClaims, verifyClaimOTP } from '../../services/food';
import { FaSpinner, FaCheck, FaClock, FaMapMarkerAlt, FaUser, FaPhone, FaKey, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState({});
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getReceiverClaims();
      setOrders(data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (orderId) => {
    const otp = otpInput[orderId];
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setVerifying(prev => ({ ...prev, [orderId]: true }));
    try {
      await verifyClaimOTP(orderId, otp);
      toast.success('🎉 Pickup completed successfully!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifying(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: <FaHourglassHalf />, title: 'Pending Payment', message: 'Complete payment to confirm your order' };
      case 'accepted': return { color: 'bg-blue-100 text-blue-800', icon: <FaCheck />, title: 'Ready for Pickup', message: 'Enter OTP to complete pickup' };
      case 'completed': return { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle />, title: 'Completed', message: 'Pickup completed successfully!' };
      case 'rejected': return { color: 'bg-red-100 text-red-800', icon: <FaTimesCircle />, title: 'Rejected', message: 'Order was rejected' };
      default: return { color: 'bg-gray-100 text-gray-800', icon: null, title: 'Unknown', message: '' };
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><FaSpinner className="animate-spin text-4xl text-green-500" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 text-lg">No orders yet</p>
            <a href="/receiver/dashboard" className="inline-block mt-4 bg-green-500 text-white px-6 py-2 rounded-lg">Browse Products</a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{order.food?.name}</h3>
                        <p className="text-sm text-gray-500">Order ID: {order._id.slice(-8)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusConfig.color}`}>
                        {statusConfig.icon}{statusConfig.title}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div><p className="text-sm text-gray-500">Seller</p><p className="font-medium">{order.donor?.name}</p><p className="text-sm">{order.donor?.phone}</p></div>
                      <div><p className="text-sm text-gray-500">Amount</p><p className="font-medium text-green-600 flex items-center gap-1"><FaRupeeSign />{order.amount}</p></div>
                      <div><p className="text-sm text-gray-500">Pickup Address</p><p className="text-sm">{order.food?.pickupAddress}</p></div>
                      <div><p className="text-sm text-gray-500">Ordered On</p><p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                    </div>
                    
                    {order.status === 'accepted' && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex gap-3">
                          <input type="text" maxLength="6" placeholder="Enter 6-digit OTP" className="flex-1 px-4 py-2 border border-blue-300 rounded-lg text-center font-mono text-xl tracking-wider"
                            value={otpInput[order._id] || ''}
                            onChange={(e) => setOtpInput({...otpInput, [order._id]: e.target.value.replace(/\D/g, '').slice(0, 6)})} />
                          <button onClick={() => handleVerifyOTP(order._id)} disabled={verifying[order._id]}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2">
                            {verifying[order._id] ? <FaSpinner className="animate-spin" /> : <FaCheck />} Verify & Complete
                          </button>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">⏰ OTP is valid for 30 minutes</p>
                      </div>
                    )}
                    
                    {order.status === 'completed' && order.completedAt && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-sm text-green-700">Completed on {new Date(order.completedAt).toLocaleDateString()}</p>
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

export default BuyerOrders;