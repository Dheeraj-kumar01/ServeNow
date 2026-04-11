import React, { useState, useEffect } from 'react';
import { 
  getDonorFoodListings, 
  acceptClaimRequest, 
  rejectClaimRequest, 
  generateClaimOTP 
} from '../../services/food';
import { 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaTimes, 
  FaKey, 
  FaSpinner,
  FaClock,
  FaMapMarkerAlt,
  FaUtensils,
  FaUser,
  FaPhone,
  FaImage
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Get backend URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// Local placeholder image (using data URI for reliability)
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ccircle cx="100" cy="100" r="60" fill="%23e5e7eb"/%3E%3Cpath d="M70 80 L130 80 L120 130 L80 130 Z" fill="%239ca3af"/%3E%3Ccircle cx="100" cy="95" r="12" fill="%23d1d5db"/%3E%3Cpath d="M95 95 L105 95 L100 105 Z" fill="%239ca3af"/%3E%3Ctext x="100" y="170" text-anchor="middle" fill="%236b7280" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingClaims, setProcessingClaims] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await getDonorFoodListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClaim = async (claimId) => {
    setProcessingClaims(prev => ({ ...prev, [claimId]: true }));
    try {
      await acceptClaimRequest(claimId);
      const response = await generateClaimOTP(claimId);
      const otp = response.otp || response;
      toast.success(`Claim accepted! Share OTP: ${otp} with the receiver`);
      fetchListings(); // Refresh to update status
    } catch (error) {
      console.error('Error accepting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to accept claim');
    } finally {
      setProcessingClaims(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to reject this claim?')) return;
    
    setProcessingClaims(prev => ({ ...prev, [claimId]: true }));
    try {
      await rejectClaimRequest(claimId);
      toast.success('Claim rejected');
      fetchListings(); // Refresh to update status
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error(error.response?.data?.message || 'Failed to reject claim');
    } finally {
      setProcessingClaims(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getClaimStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imageErrors[imagePath]) {
      return DEFAULT_IMAGE;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Remove /api from the URL for static files
    return `${BACKEND_URL}${imagePath}`;
  };

  const handleImageError = (imagePath) => {
    setImageErrors(prev => ({ ...prev, [imagePath]: true }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Food Listings</h1>
      
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No food listings yet</p>
          <button
            onClick={() => window.location.href = '/donor/add-food'}
            className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
          >
            Add Your First Food
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map(listing => (
            <div key={listing._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                {/* Image */}
                <div className="md:w-48 h-48 md:h-auto bg-gray-100 flex items-center justify-center">
                  <img
                    src={getImageUrl(listing.image)}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      handleImageError(listing.image);
                      e.target.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{listing.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Added on {new Date(listing.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(listing.status)}`}>
                      {listing.status?.toUpperCase() || 'AVAILABLE'}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <FaUtensils className="text-gray-400 mr-2" />
                      <span className="text-gray-500">Quantity:</span>
                      <span className="ml-2 font-medium">{listing.quantity} {listing.unit}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-gray-400 mr-2" />
                      <span className="text-gray-500">Expires:</span>
                      <span className="ml-2 font-medium">
                        {new Date(listing.expiryDate).toLocaleDateString()} at {listing.expiryTime}
                      </span>
                    </div>
                    <div className="flex items-center sm:col-span-2">
                      <FaMapMarkerAlt className="text-gray-400 mr-2" />
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-2">{listing.pickupAddress}</span>
                    </div>
                  </div>
                  
                  {/* Claims Section */}
                  {listing.claims && listing.claims.length > 0 && (
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Claims Received ({listing.claims.length})</h4>
                      <div className="space-y-3">
                        {listing.claims.map(claim => (
                          <div key={claim._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <FaUser className="text-gray-400" />
                                  <p className="font-medium text-gray-900">{claim.receiver?.name || 'Receiver'}</p>
                                </div>
                                {claim.receiver?.phone && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <FaPhone className="text-gray-400 text-xs" />
                                    <p className="text-sm text-gray-600">{claim.receiver.phone}</p>
                                  </div>
                                )}
                                <p className="text-sm text-gray-600 mt-2">
                                  Claimed on: {new Date(claim.createdAt).toLocaleString()}
                                </p>
                                {claim.message && (
                                  <p className="text-sm text-gray-500 mt-2 italic">
                                    "{claim.message}"
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getClaimStatusColor(claim.status)}`}>
                                  {claim.status?.toUpperCase() || 'PENDING'}
                                </span>
                                <div className="flex gap-2">
                                  {claim.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptClaim(claim._id)}
                                        disabled={processingClaims[claim._id]}
                                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-1 text-sm"
                                      >
                                        {processingClaims[claim._id] ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectClaim(claim._id)}
                                        disabled={processingClaims[claim._id]}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 flex items-center gap-1 text-sm"
                                      >
                                        <FaTimes />
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {claim.status === 'accepted' && (
                                    <div className="flex items-center gap-2">
                                      <FaKey className="text-blue-500" />
                                      <span className="text-sm font-mono font-bold bg-gray-200 px-2 py-1 rounded">
                                        {claim.otp || 'OTP Generated'}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Share with receiver
                                      </span>
                                    </div>
                                  )}
                                  {claim.status === 'completed' && (
                                    <div className="flex items-center gap-2">
                                      <FaCheck className="text-green-500" />
                                      <span className="text-sm text-green-600">Completed ✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {claim.otp && claim.status === 'accepted' && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800 flex items-center gap-2">
                                  <FaKey />
                                  <span className="font-semibold">Verification OTP:</span>
                                  <span className="font-mono font-bold text-lg tracking-wider">{claim.otp}</span>
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Share this OTP with the receiver for pickup verification
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;