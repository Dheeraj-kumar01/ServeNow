import React, { useState, useEffect } from 'react';
import { getReceiverClaims, verifyClaimOTP } from '../../services/food';
import { 
  FaSpinner, 
  FaCheck, 
  FaClock, 
  FaMapMarkerAlt, 
  FaUser, 
  FaPhone, 
  FaKey, 
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaUtensils,
  FaTruck,
  FaStore,
  FaInfoCircle,
  FaRegSmile,
  FaGift
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Get backend URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// Default placeholder image
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ccircle cx="100" cy="100" r="60" fill="%23e5e7eb"/%3E%3Cpath d="M70 80 L130 80 L120 130 L80 130 Z" fill="%239ca3af"/%3E%3Ccircle cx="100" cy="95" r="12" fill="%23d1d5db"/%3E%3Cpath d="M95 95 L105 95 L100 105 Z" fill="%239ca3af"/%3E%3Ctext x="100" y="170" text-anchor="middle" fill="%236b7280" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

const ReceiverClaims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState({});
  const [verifying, setVerifying] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [justCompleted, setJustCompleted] = useState({});

  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchClaims = async () => {
    try {
      const data = await getReceiverClaims();
      setClaims(data);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error('Failed to load claims');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (claimId) => {
    const otp = otpInput[claimId];
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setVerifying(prev => ({ ...prev, [claimId]: true }));
    try {
      const response = await verifyClaimOTP(claimId, otp);
      
      // Mark as just completed to show success animation
      setJustCompleted(prev => ({ ...prev, [claimId]: true }));
      
      toast.success('🎉 Pickup completed successfully! Thank you for reducing food waste!', {
        duration: 5000,
        icon: '🎉'
      });
      
      // Clear OTP input for this claim
      setOtpInput(prev => ({ ...prev, [claimId]: '' }));
      
      // Refresh claims to update status
      await fetchClaims();
      
      // Remove just completed flag after animation
      setTimeout(() => {
        setJustCompleted(prev => ({ ...prev, [claimId]: false }));
      }, 3000);
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifying(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imageErrors[imagePath]) {
      return DEFAULT_IMAGE;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  const handleImageError = (imagePath) => {
    setImageErrors(prev => ({ ...prev, [imagePath]: true }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          borderColor: 'border-yellow-200',
          bgLight: 'bg-yellow-50',
          icon: <FaHourglassHalf className="text-yellow-500 text-2xl" />,
          title: 'Pending Approval',
          message: 'Your request is waiting for donor approval',
          instruction: 'The donor will review your request shortly'
        };
      case 'accepted':
        return {
          color: 'bg-blue-100 text-blue-800',
          borderColor: 'border-blue-200',
          bgLight: 'bg-blue-50',
          icon: <FaKey className="text-blue-500 text-2xl" />,
          title: 'Ready for Pickup',
          message: 'Donor has accepted your request',
          instruction: 'Enter the OTP shared by donor to complete pickup'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800',
          borderColor: 'border-red-200',
          bgLight: 'bg-red-50',
          icon: <FaTimesCircle className="text-red-500 text-2xl" />,
          title: 'Request Rejected',
          message: 'Donor could not fulfill your request',
          instruction: 'You can browse other available food items'
        };
      case 'completed':
        return {
          color: 'bg-green-100 text-green-800',
          borderColor: 'border-green-200',
          bgLight: 'bg-green-50',
          icon: <FaCheckCircle className="text-green-500 text-2xl" />,
          title: 'Pickup Completed! 🎉',
          message: 'You have successfully received the food',
          instruction: 'Thank you for helping reduce food waste!'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          borderColor: 'border-gray-200',
          bgLight: 'bg-gray-50',
          icon: <FaInfoCircle className="text-gray-500 text-2xl" />,
          title: 'Unknown Status',
          message: 'Status unknown',
          instruction: 'Please contact support'
        };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
      </div>
    );
  }

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const acceptedClaims = claims.filter(c => c.status === 'accepted');
  const completedClaims = claims.filter(c => c.status === 'completed');
  const rejectedClaims = claims.filter(c => c.status === 'rejected');

  const ClaimCard = ({ claim }) => {
    const statusConfig = getStatusConfig(claim.status);
    const food = claim.food || {};
    const donor = claim.donor || {};
    const imageUrl = getImageUrl(food.image);
    const isJustCompleted = justCompleted[claim._id];

    return (
      <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${statusConfig.borderColor.replace('border-', 'border-l-')} ${isJustCompleted ? 'animate-pulse ring-2 ring-green-400' : ''}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={imageUrl}
                  alt={food.name || 'Food Item'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    handleImageError(food.image);
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{food.name || 'Food Item'}</h3>
                <p className="text-sm text-gray-500">
                  Claimed on {formatDate(claim.createdAt)}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
              {statusConfig.icon}
              <span className="text-sm font-semibold">{statusConfig.title}</span>
            </div>
          </div>

          {/* Food Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-gray-600 text-sm">
              <FaUtensils className="mr-2 text-gray-400" />
              <span className="font-medium">Quantity:</span>
              <span className="ml-2">{food.quantity} {food.unit}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <span className="font-medium">Pickup:</span>
              <span className="ml-2 truncate">{food.pickupAddress || 'Address not specified'}</span>
            </div>
          </div>

          {/* Donor Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FaStore className="text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Donor Details</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center text-gray-600 text-sm">
                <FaUser className="mr-2 text-gray-400" />
                <span>{donor.name || 'Anonymous Donor'}</span>
              </div>
              {donor.phone && (
                <div className="flex items-center text-gray-600 text-sm">
                  <FaPhone className="mr-2 text-gray-400" />
                  <span>{donor.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Specific Content */}
          {claim.status === 'pending' && (
            <div className={`p-4 rounded-lg ${statusConfig.bgLight} border ${statusConfig.borderColor}`}>
              <div className="flex items-start gap-3">
                <FaHourglassHalf className="text-yellow-500 text-lg mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">{statusConfig.message}</p>
                  <p className="text-xs text-yellow-600 mt-1">{statusConfig.instruction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Accepted Claims - Show OTP Input Form */}
          {claim.status === 'accepted' && (
            <div className={`p-4 rounded-lg ${statusConfig.bgLight} border ${statusConfig.borderColor}`}>
              <div className="flex items-start gap-3 mb-3">
                <FaKey className="text-blue-500 text-lg mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">{statusConfig.message}</p>
                  <p className="text-xs text-blue-600">{statusConfig.instruction}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-xl tracking-wider"
                  value={otpInput[claim._id] || ''}
                  onChange={(e) => setOtpInput({...otpInput, [claim._id]: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                />
                <button
                  onClick={() => handleVerifyOTP(claim._id)}
                  disabled={verifying[claim._id]}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 font-medium transition-all"
                >
                  {verifying[claim._id] ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                  Verify & Complete
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-3 flex items-center gap-1">
                <FaClock size={10} />
                OTP is valid for 30 minutes. Contact the donor if you need a new OTP.
              </p>
            </div>
          )}

          {/* Completed Claims - Show Success Message (NO OTP FORM) */}
          {claim.status === 'completed' && (
            <div className={`p-4 rounded-lg ${statusConfig.bgLight} border ${statusConfig.borderColor} animate-fade-in`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-green-800 flex items-center gap-2">
                    {statusConfig.message}
                    <FaGift className="text-green-600" />
                  </p>
                  <p className="text-sm text-green-700 mt-1">{statusConfig.instruction}</p>
                  {claim.completedAt && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <FaClock size={10} />
                      Completed on {formatDate(claim.completedAt)}
                    </p>
                  )}
                  <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <FaRegSmile className="text-green-600" />
                      Thank you for helping reduce food waste and feeding those in need!
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Your contribution helps us build a hunger-free world. 🌍
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rejected Claims */}
          {claim.status === 'rejected' && (
            <div className={`p-4 rounded-lg ${statusConfig.bgLight} border ${statusConfig.borderColor}`}>
              <div className="flex items-start gap-3">
                <FaTimesCircle className="text-red-500 text-lg mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">{statusConfig.message}</p>
                  <p className="text-xs text-red-600 mt-1">{statusConfig.instruction}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
          <p className="text-gray-600 mt-2">Track and manage all your claimed food items</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-yellow-600">{pendingClaims.length}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-blue-600">{acceptedClaims.length}</p>
            <p className="text-sm text-gray-500">Ready for Pickup</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-green-600">{completedClaims.length}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-red-600">{rejectedClaims.length}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
        </div>

        {/* Claims List */}
        {claims.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Claims Yet</h3>
            <p className="text-gray-500 mb-4">You haven't claimed any food items yet</p>
            <a
              href="/receiver/dashboard"
              className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all"
            >
              Find Food Near You
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Claims */}
            {pendingClaims.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaHourglassHalf className="text-yellow-500" />
                  Awaiting Approval ({pendingClaims.length})
                </h2>
                {pendingClaims.map(claim => (
                  <ClaimCard key={claim._id} claim={claim} />
                ))}
              </div>
            )}

            {/* Accepted Claims - Ready for Pickup */}
            {acceptedClaims.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaTruck className="text-blue-500" />
                  Ready for Pickup ({acceptedClaims.length})
                </h2>
                {acceptedClaims.map(claim => (
                  <ClaimCard key={claim._id} claim={claim} />
                ))}
              </div>
            )}

            {/* Completed Claims */}
            {completedClaims.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" />
                  Completed ({completedClaims.length})
                </h2>
                {completedClaims.map(claim => (
                  <ClaimCard key={claim._id} claim={claim} />
                ))}
              </div>
            )}

            {/* Rejected Claims */}
            {rejectedClaims.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  Rejected ({rejectedClaims.length})
                </h2>
                {rejectedClaims.map(claim => (
                  <ClaimCard key={claim._id} claim={claim} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverClaims;