import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  getDonorStats, 
  getDonorRecentClaims, 
  acceptClaimRequest, 
  rejectClaimRequest, 
  generateClaimOTP 
} from '../../services/food';
import { useAuth } from '../../context/AuthContext';
import { 
  FaPlus, 
  FaList, 
  FaUtensils, 
  FaCheckCircle, 
  FaClock, 
  FaUsers, 
  FaSpinner, 
  FaCheck, 
  FaTimes, 
  FaKey,
  FaTruck,
  FaStore
} from 'react-icons/fa';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeListings: 0,
    completedDonations: 0,
    totalBeneficiaries: 0
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingClaims, setProcessingClaims] = useState({});

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, claimsData] = await Promise.all([
        getDonorStats(),
        getDonorRecentClaims()
      ]);
      setStats(statsData);
      setRecentClaims(claimsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalDonations: 0,
        activeListings: 0,
        completedDonations: 0,
        totalBeneficiaries: 0
      });
      setRecentClaims([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Accept Claim with OTP Generation
  const handleAcceptClaim = async (claimId) => {
    setProcessingClaims(prev => ({ ...prev, [claimId]: true }));
    try {
      // First accept the claim
      await acceptClaimRequest(claimId);
      
      // Then generate OTP
      const response = await generateClaimOTP(claimId);
      const otp = response.otp;
      
      // Show success message
      toast.success(`✅ Claim accepted!`, {
        duration: 5000,
        icon: '✅'
      });
      
      // Show OTP in a separate toast with longer duration
      toast.success(`🔑 OTP: ${otp} - Share this with the receiver`, {
        duration: 10000,
        icon: '🔑',
        style: {
          background: '#1e40af',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
      
      // Also log to console for debugging
      console.log(`OTP for claim ${claimId}: ${otp}`);
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to accept claim');
    } finally {
      setProcessingClaims(prev => ({ ...prev, [claimId]: false }));
    }
  };

  // Handle Reject Claim
  const handleRejectClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to reject this claim?')) return;
    
    setProcessingClaims(prev => ({ ...prev, [claimId]: true }));
    try {
      await rejectClaimRequest(claimId);
      toast.success('❌ Claim rejected', {
        icon: '❌'
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to reject claim');
    } finally {
      setProcessingClaims(prev => ({ ...prev, [claimId]: false }));
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async (claimId) => {
    try {
      const response = await generateClaimOTP(claimId);
      const otp = response.otp;
      toast.success(`🔄 New OTP generated: ${otp}`, {
        duration: 10000,
        icon: '🔄',
        style: {
          background: '#1e40af',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      });
      console.log(`New OTP for claim ${claimId}: ${otp}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'PENDING', icon: <FaClock className="text-yellow-500" /> };
      case 'accepted':
        return { color: 'bg-blue-100 text-blue-800', text: 'ACCEPTED', icon: <FaCheck className="text-blue-500" /> };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', text: 'REJECTED', icon: <FaTimes className="text-red-500" /> };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', text: 'COMPLETED', icon: <FaCheckCircle className="text-green-500" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status?.toUpperCase() || 'UNKNOWN', icon: null };
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Track your donations and impact on the community
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Donations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
              </div>
              <FaUtensils className="text-green-500 text-3xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
              <FaClock className="text-blue-500 text-3xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedDonations}</p>
              </div>
              <FaCheckCircle className="text-purple-500 text-3xl" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBeneficiaries}</p>
              </div>
              <FaUsers className="text-orange-500 text-3xl" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/donor/add-food">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all hover:scale-105 transform duration-300">
              <FaPlus className="text-3xl mb-3" />
              <h3 className="text-xl font-semibold">Add New Food</h3>
              <p className="text-green-100 mt-2">Share excess food with those in need</p>
            </div>
          </Link>

          <Link to="/donor/listings">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all hover:scale-105 transform duration-300">
              <FaList className="text-3xl mb-3" />
              <h3 className="text-xl font-semibold">My Listings</h3>
              <p className="text-blue-100 mt-2">Manage your active donations</p>
            </div>
          </Link>
        </div>

        {/* Recent Claims Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Claims</h2>
            <span className="text-sm text-gray-500">
              {recentClaims.length} {recentClaims.length === 1 ? 'claim' : 'claims'} received
            </span>
          </div>
          
          {recentClaims.length === 0 ? (
            <div className="text-center py-12">
              <FaTruck className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No claims yet</p>
              <p className="text-sm text-gray-400 mt-1">When someone claims your food, it will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentClaims.map(claim => {
                const statusBadge = getStatusBadge(claim.status);
                return (
                  <div key={claim._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FaStore className="text-green-600" />
                          <h4 className="font-semibold text-gray-900 text-lg">{claim.food?.name || 'Food Item'}</h4>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                            {statusBadge.icon}
                            {statusBadge.text}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Receiver:</span> {claim.receiver?.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {claim.receiver?.phone || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Claimed:</span> {new Date(claim.createdAt).toLocaleString()}
                          </p>
                          {claim.message && (
                            <p className="text-sm text-gray-500 italic mt-2 p-2 bg-gray-50 rounded">
                              "{claim.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 min-w-[200px]">
                        {/* Pending Claims - Show Accept/Reject Buttons */}
                        {claim.status === 'pending' && (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => handleAcceptClaim(claim._id)}
                              disabled={processingClaims[claim._id]}
                              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                            >
                              {processingClaims[claim._id] ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectClaim(claim._id)}
                              disabled={processingClaims[claim._id]}
                              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                            >
                              <FaTimes />
                              Reject
                            </button>
                          </div>
                        )}
                        
                        {/* Accepted Claims - Show OTP with Resend Button */}
                        {claim.status === 'accepted' && (
                          <div className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FaKey className="text-blue-500" />
                                <span className="font-semibold text-blue-700">OTP:</span>
                                <span className="font-mono font-bold text-xl tracking-wider text-blue-800">
                                  {claim.otp || '-----'}
                                </span>
                              </div>
                              <button
                                onClick={() => handleResendOTP(claim._id)}
                                className="text-xs text-blue-600 hover:text-blue-700 underline font-medium"
                              >
                                Resend
                              </button>
                            </div>
                            <p className="text-xs text-blue-600">
                              Share this OTP with receiver for pickup verification
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              ⏰ Valid for 30 minutes
                            </p>
                          </div>
                        )}
                        
                        {/* Completed Claims */}
                        {claim.status === 'completed' && (
                          <div className="w-full p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <FaCheckCircle />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                            {claim.completedAt && (
                              <p className="text-xs text-green-600 mt-1">
                                {new Date(claim.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Rejected Claims */}
                        {claim.status === 'rejected' && (
                          <div className="w-full p-3 bg-red-50 rounded-lg border border-red-200 text-center">
                            <div className="flex items-center justify-center gap-2 text-red-600">
                              <FaTimes />
                              <span className="text-sm font-medium">Rejected</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;5