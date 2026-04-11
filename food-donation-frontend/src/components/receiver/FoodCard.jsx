import React, { useState, useEffect } from 'react';
import { formatTimeToExpiry, formatDateTime } from '../../utils/formatters';
import { 
  FaClock, 
  FaMapMarkerAlt, 
  FaUtensils, 
  FaLeaf, 
  FaComments, 
  FaMap, 
  FaUser, 
  FaPhone, 
  FaCheck, 
  FaHourglassHalf, 
  FaTruck, 
  FaExclamationTriangle,
  FaEgg,
  FaHeart
} from 'react-icons/fa';
import { differenceInMinutes, isBefore } from 'date-fns';
import ChatBox from '../chat/ChatBox';
import toast from 'react-hot-toast';

// Get backend URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

// Local placeholder image
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ccircle cx="100" cy="100" r="60" fill="%23e5e7eb"/%3E%3Cpath d="M70 80 L130 80 L120 130 L80 130 Z" fill="%239ca3af"/%3E%3Ccircle cx="100" cy="95" r="12" fill="%23d1d5db"/%3E%3Cpath d="M95 95 L105 95 L100 105 Z" fill="%239ca3af"/%3E%3Ctext x="100" y="170" text-anchor="middle" fill="%236b7280" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

const FoodCard = ({ food, userLocation, onClaim, onViewMap }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Construct image URL
  const getImageUrl = () => {
    if (!food.image || imageError) {
      return DEFAULT_IMAGE;
    }
    if (food.image.startsWith('http')) {
      return food.image;
    }
    return `${BACKEND_URL}${food.image}`;
  };

  // FIXED: Parse expiry date - Handle both ISO string and separate date/time
  useEffect(() => {
    if (food.expiryDate && food.expiryTime) {
      try {
        // Handle both ISO string (e.g., '2026-04-02T00:00:00.000Z') and separate date string
        let dateStr = food.expiryDate;
        
        // If it's an ISO string, extract just the date part
        if (food.expiryDate.includes('T')) {
          dateStr = food.expiryDate.split('T')[0];
        }
        
        // Combine date and time
        const expiryDateTime = new Date(`${dateStr}T${food.expiryTime}`);
        
        // Validate if date is valid
        if (!isNaN(expiryDateTime.getTime())) {
          setExpiryDate(expiryDateTime);
          
          // Check if already expired
          if (isBefore(expiryDateTime, new Date())) {
            setIsExpired(true);
          }
        } else {
          console.error('Invalid expiry date format:', { 
            originalDate: food.expiryDate, 
            parsedDate: dateStr, 
            time: food.expiryTime 
          });
          setIsExpired(true);
        }
      } catch (error) {
        console.error('Error parsing expiry date:', error);
        setIsExpired(true);
      }
    } else {
      // If no expiry date/time, consider as expired
      setIsExpired(true);
    }
  }, [food.expiryDate, food.expiryTime]);

  // Update countdown timer every minute
  useEffect(() => {
    if (!expiryDate || isExpired) return;
    
    const updateTimer = () => {
      try {
        const remaining = formatTimeToExpiry(expiryDate);
        setTimeRemaining(remaining);
        
        // Check if just expired
        if (remaining === 'Expired' && !isExpired) {
          setIsExpired(true);
        }
      } catch (error) {
        console.error('Error updating timer:', error);
        setTimeRemaining('Expired');
        setIsExpired(true);
      }
    };
    
    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    
    return () => clearInterval(timer);
  }, [expiryDate, isExpired]);

  const getUrgencyColor = () => {
    if (!expiryDate || isExpired) return 'bg-gray-100 text-gray-800';
    
    try {
      const minutesLeft = differenceInMinutes(expiryDate, new Date());
      if (minutesLeft < 60) return 'bg-red-100 text-red-800 animate-pulse';
      if (minutesLeft < 180) return 'bg-orange-100 text-orange-800';
      if (minutesLeft < 360) return 'bg-yellow-100 text-yellow-800';
      return 'bg-green-100 text-green-800';
    } catch (error) {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = () => {
    if (!expiryDate || isExpired) return null;
    
    try {
      const minutesLeft = differenceInMinutes(expiryDate, new Date());
      if (minutesLeft < 60) return <FaExclamationTriangle className="mr-1" />;
      if (minutesLeft < 180) return <FaHourglassHalf className="mr-1" />;
      return null;
    } catch (error) {
      return null;
    }
  };

  const getStatusBadge = () => {
    if (isExpired) {
      return {
        text: 'Expired',
        color: 'bg-gray-100 text-gray-600',
        icon: null
      };
    }
    
    if (food.status === 'claimed') {
      return {
        text: 'Claimed',
        color: 'bg-blue-100 text-blue-800',
        icon: <FaCheck className="mr-1" />
      };
    }
    
    if (food.status === 'pending') {
      return {
        text: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FaHourglassHalf className="mr-1" />
      };
    }
    
    if (food.isUrgent) {
      return {
        text: 'Urgent',
        color: 'bg-red-100 text-red-800 animate-pulse',
        icon: <FaExclamationTriangle className="mr-1" />
      };
    }
    
    return {
      text: 'Available',
      color: 'bg-green-100 text-green-800',
      icon: null
    };
  };

  const handleClaimClick = async () => {
    if (isExpired) {
      toast.error('This food has expired and is no longer available');
      return;
    }
    
    if (food.status !== 'available') {
      toast.error('This food is no longer available');
      return;
    }
    
    setIsClaiming(true);
    try {
      await onClaim(food._id);
      toast.success(`Successfully claimed ${food.name}! Check your dashboard for details.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to claim food');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleViewMap = () => {
    if (onViewMap) {
      onViewMap(food);
    } else if (userLocation && food.location?.coordinates) {
      const [lng, lat] = food.location.coordinates;
      const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat},${userLocation.lng};${lat},${lng}`;
      window.open(url, '_blank');
    } else {
      toast.error('Unable to open map. Location data missing.');
    }
  };

  const status = getStatusBadge();
  const canClaim = food.status === 'available' && !isExpired;
  const distance = food.distance ? 
    (food.distance < 1 ? `${(food.distance * 1000).toFixed(0)}m` : `${food.distance.toFixed(1)}km`) 
    : 'Unknown';

  // Get dietary icon based on type
  const getDietaryIcon = () => {
    if (food.dietaryType === 'veg') {
      return {
        icon: <FaLeaf className="mr-1" size={10} />,
        label: 'VEG',
        bgColor: 'bg-green-500'
      };
    } else if (food.dietaryType === 'non-veg') {
      return {
        icon: <FaEgg className="mr-1" size={10} />,
        label: 'NON-VEG',
        bgColor: 'bg-red-500'
      };
    } else {
      return {
        icon: <FaHeart className="mr-1" size={10} />,
        label: 'VEGAN',
        bgColor: 'bg-green-600'
      };
    }
  };

  const dietary = getDietaryIcon();
  const imageUrl = getImageUrl();

  // Helper function to format expiry date for display
  const getFormattedExpiry = () => {
    if (!food.expiryDate || !food.expiryTime) return 'Date not specified';
    
    try {
      let dateStr = food.expiryDate;
      if (food.expiryDate.includes('T')) {
        dateStr = food.expiryDate.split('T')[0];
      }
      return `${new Date(dateStr).toLocaleDateString()} at ${food.expiryTime}`;
    } catch (error) {
      return `${food.expiryDate} at ${food.expiryTime}`;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={food.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.error('Image failed to load:', imageUrl);
              setImageError(true);
              setImageLoaded(true);
              e.target.src = DEFAULT_IMAGE;
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            {food.isUrgent && !isExpired && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse flex items-center">
                <FaExclamationTriangle className="mr-1" size={12} />
                URGENT
              </div>
            )}
            <div className={`${dietary.bgColor} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center`}>
              {dietary.icon}
              {dietary.label}
            </div>
          </div>
          
          {/* Distance Badge */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            📍 {distance}
          </div>
          
          {/* Status Badge */}
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center ${status.color} shadow-lg`}>
            {status.icon}
            {status.text}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{food.name}</h3>
            {!isExpired && expiryDate && timeRemaining && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor()}`}>
                {getUrgencyIcon()}
                {timeRemaining}
              </span>
            )}
          </div>

          {/* Donor Info */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center text-gray-600 text-sm">
              <FaUser className="mr-1" size={12} />
              <span className="font-medium">{food.donor?.name || 'Anonymous Donor'}</span>
            </div>
            {food.donor?.phone && (
              <div className="flex items-center text-gray-500 text-xs">
                <FaPhone className="mr-1" size={10} />
                <span>{food.donor.phone}</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <FaUtensils className="mr-2 flex-shrink-0" />
              <span>
                <span className="font-medium">{food.quantity} {food.unit}</span>
                {food.category && <span className="text-gray-400 ml-1">• {food.category}</span>}
              </span>
            </div>

            <div className="flex items-start text-gray-600 text-sm">
              <FaClock className="mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span>Expires: </span>
                <span className="font-medium">
                  {getFormattedExpiry()}
                </span>
              </div>
            </div>

            <div className="flex items-start text-gray-600 text-sm">
              <FaMapMarkerAlt className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{food.pickupAddress}</span>
            </div>
          </div>

          {/* Description */}
          {food.description && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {showFullDescription || food.description.length <= 100
                  ? food.description
                  : `${food.description.substring(0, 100)}...`}
                {food.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="ml-1 text-green-600 hover:text-green-700 text-xs font-medium"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleClaimClick}
              disabled={!canClaim || isClaiming}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                canClaim
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isClaiming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Claiming...
                </>
              ) : (
                <>
                  <FaTruck />
                  {canClaim ? 'Claim Food' : 'Not Available'}
                </>
              )}
            </button>
            
            {/* Chat Button */}
            <button
              onClick={() => setShowChat(true)}
              disabled={isExpired}
              className={`px-4 py-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${
                !isExpired
                  ? 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-green-300'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={isExpired ? 'Chat unavailable for expired items' : 'Chat with donor'}
            >
              <FaComments />
              <span className="hidden sm:inline">Chat</span>
            </button>

            <button
              onClick={handleViewMap}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-green-300 transition-all duration-200 flex items-center justify-center gap-2"
              title="View on map"
            >
              <FaMap />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {/* Additional Info */}
          {food.notes && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">Note:</span> {food.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <ChatBox
          donorId={food.donor?._id || food.donorId}
          foodId={food._id}
          donorName={food.donor?.name || 'Donor'}
          foodName={food.name}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default FoodCard;