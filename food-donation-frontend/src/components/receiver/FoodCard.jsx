import React, { useState, useEffect } from 'react';
import { formatTimeToExpiry, formatDateTime } from '../../utils/formatters';
import { 
  FaClock, FaMapMarkerAlt, FaUtensils, FaLeaf, FaComments, FaMap, 
  FaUser, FaPhone, FaCheck, FaHourglassHalf, FaTruck, FaExclamationTriangle,
  FaEgg, FaHeart, FaRupeeSign, FaShoppingCart
} from 'react-icons/fa';
import { differenceInMinutes, isBefore } from 'date-fns';
import ChatBox from '../chat/ChatBox';
import PaymentButton from '../payment/PaymentButton';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');
const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ccircle cx="100" cy="100" r="60" fill="%23e5e7eb"/%3E%3Cpath d="M70 80 L130 80 L120 130 L80 130 Z" fill="%239ca3af"/%3E%3Ccircle cx="100" cy="95" r="12" fill="%23d1d5db"/%3E%3Cpath d="M95 95 L105 95 L100 105 Z" fill="%239ca3af"/%3E%3Ctext x="100" y="170" text-anchor="middle" fill="%236b7280" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

const FoodCard = ({ food, userLocation, onClaim, onViewMap }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [orderCreated, setOrderCreated] = useState(null);

  const getImageUrl = () => {
    if (!food.image || imageError) return DEFAULT_IMAGE;
    if (food.image.startsWith('http')) return food.image;
    return `${BACKEND_URL}${food.image}`;
  };

  useEffect(() => {
    if (food.expiryDate && food.expiryTime) {
      try {
        let dateStr = food.expiryDate;
        if (food.expiryDate.includes('T')) dateStr = food.expiryDate.split('T')[0];
        const expiryDateTime = new Date(`${dateStr}T${food.expiryTime}`);
        if (!isNaN(expiryDateTime.getTime())) {
          setExpiryDate(expiryDateTime);
          if (isBefore(expiryDateTime, new Date())) setIsExpired(true);
        }
      } catch (error) {
        setIsExpired(true);
      }
    }
  }, [food.expiryDate, food.expiryTime]);

  useEffect(() => {
    if (!expiryDate || isExpired) return;
    const updateTimer = () => {
      const remaining = formatTimeToExpiry(expiryDate);
      setTimeRemaining(remaining);
      if (remaining === 'Expired' && !isExpired) setIsExpired(true);
    };
    updateTimer();
    const timer = setInterval(updateTimer, 60000);
    return () => clearInterval(timer);
  }, [expiryDate, isExpired]);

  const getUrgencyColor = () => {
    if (!expiryDate || isExpired) return 'bg-gray-100 text-gray-800';
    const minutesLeft = differenceInMinutes(expiryDate, new Date());
    if (minutesLeft < 60) return 'bg-red-100 text-red-800 animate-pulse';
    if (minutesLeft < 180) return 'bg-orange-100 text-orange-800';
    if (minutesLeft < 360) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getUrgencyIcon = () => {
    if (!expiryDate || isExpired) return null;
    const minutesLeft = differenceInMinutes(expiryDate, new Date());
    if (minutesLeft < 60) return <FaExclamationTriangle className="mr-1" />;
    if (minutesLeft < 180) return <FaHourglassHalf className="mr-1" />;
    return null;
  };

  const getStatusBadge = () => {
    if (isExpired) return { text: 'Expired', color: 'bg-gray-100 text-gray-600', icon: null };
    if (food.orderStatus === 'requested') return { text: 'Requested', color: 'bg-yellow-100 text-yellow-800', icon: <FaHourglassHalf className="mr-1" /> };
    if (food.orderStatus === 'accepted') return { text: 'Accepted', color: 'bg-blue-100 text-blue-800', icon: <FaCheck className="mr-1" /> };
    if (food.orderStatus === 'delivered') return { text: 'Delivered', color: 'bg-green-100 text-green-800', icon: <FaCheck className="mr-1" /> };
    if (food.isUrgent) return { text: 'Urgent', color: 'bg-red-100 text-red-800 animate-pulse', icon: <FaExclamationTriangle className="mr-1" /> };
    return { text: 'Available', color: 'bg-green-100 text-green-800', icon: null };
  };

  const handleBuyNow = async () => {
    if (isExpired) {
      toast.error('This product has expired');
      return;
    }
    if (food.orderStatus !== 'available') {
      toast.error('Product is no longer available');
      return;
    }
    setIsOrdering(true);
    try {
      const result = await onClaim(food._id);
      console.log('Order creation result:', result);
      
      if (result && result.order) {
        setOrderCreated(result.order);
        setShowPayment(true);
      } else {
        toast.error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setIsOrdering(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    toast.success('Payment successful! Order confirmed.');
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleViewMap = () => {
    if (onViewMap) {
      onViewMap(food);
    } else if (userLocation && food.location?.coordinates) {
      const [lng, lat] = food.location.coordinates;
      window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.lat},${userLocation.lng};${lat},${lng}`, '_blank');
    }
  };

  const status = getStatusBadge();
  const canBuy = food.orderStatus === 'available' && !isExpired;
  const distance = food.distance ? (food.distance < 1 ? `${(food.distance * 1000).toFixed(0)}m` : `${food.distance.toFixed(1)}km`) : 'Unknown';

  const getDietaryIcon = () => {
    if (food.dietaryType === 'veg') return { icon: <FaLeaf className="mr-1" size={10} />, label: 'VEG', bgColor: 'bg-green-500' };
    if (food.dietaryType === 'non-veg') return { icon: <FaEgg className="mr-1" size={10} />, label: 'NON-VEG', bgColor: 'bg-red-500' };
    return { icon: <FaHeart className="mr-1" size={10} />, label: 'VEGAN', bgColor: 'bg-green-600' };
  };

  const dietary = getDietaryIcon();
  const imageUrl = getImageUrl();

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-48 bg-gradient-to-r from-gray-200 to-gray-300">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          <img src={imageUrl} alt={food.name} className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { setImageError(true); setImageLoaded(true); e.target.src = DEFAULT_IMAGE; }}
          />
          
          <div className="absolute top-2 left-2 flex gap-2">
            {food.isUrgent && !isExpired && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse flex items-center">
                <FaExclamationTriangle className="mr-1" size={12} /> URGENT
              </div>
            )}
            <div className={`${dietary.bgColor} text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center`}>
              {dietary.icon}{dietary.label}
            </div>
          </div>
          
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            📍 {distance}
          </div>
          
          <div className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg bg-white">
            <FaRupeeSign className="mr-1 text-green-600" />
            <span className="font-bold text-green-600">₹{food.price}</span>
          </div>
          
          <div className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center ${status.color} shadow-lg`}>
            {status.icon}{status.text}
          </div>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{food.name}</h3>
            {!isExpired && expiryDate && timeRemaining && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getUrgencyColor()}`}>
                {getUrgencyIcon()}{timeRemaining}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center text-gray-600 text-sm">
              <FaUser className="mr-1" size={12} />
              <span className="font-medium">{food.seller?.name || 'Anonymous Seller'}</span>
            </div>
            {food.seller?.phone && (
              <div className="flex items-center text-gray-500 text-xs">
                <FaPhone className="mr-1" size={10} />
                <span>{food.seller.phone}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <FaUtensils className="mr-2 flex-shrink-0" />
              <span><span className="font-medium">{food.quantity} {food.unit}</span>{food.category && <span className="text-gray-400 ml-1">• {food.category}</span>}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <FaRupeeSign className="mr-2 flex-shrink-0" />
              <span><span className="font-medium">Price: ₹{food.price}</span><span className="text-gray-400 ml-1">(Commission: ₹{(food.price * 0.2).toFixed(2)})</span></span>
            </div>
            <div className="flex items-start text-gray-600 text-sm">
              <FaClock className="mr-2 mt-0.5 flex-shrink-0" />
              <div><span>Expires: </span><span className="font-medium">{formatDateTime(food.expiryDate, food.expiryTime)}</span></div>
            </div>
            <div className="flex items-start text-gray-600 text-sm">
              <FaMapMarkerAlt className="mr-2 mt-0.5 flex-shrink-0" />
              <span className="flex-1">{food.pickupAddress}</span>
            </div>
          </div>

          {food.description && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {showFullDescription || food.description.length <= 100 ? food.description : `${food.description.substring(0, 100)}...`}
                {food.description.length > 100 && (
                  <button onClick={() => setShowFullDescription(!showFullDescription)} className="ml-1 text-green-600 text-xs">
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button onClick={handleBuyNow} disabled={!canBuy || isOrdering}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${canBuy ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
              {isOrdering ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</> : <><FaShoppingCart /> Buy Now</>}
            </button>
            <button onClick={() => setShowChat(true)} disabled={isExpired}
              className={`px-4 py-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 ${!isExpired ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <FaComments /><span className="hidden sm:inline">Chat</span>
            </button>
            <button onClick={handleViewMap} className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <FaMap /><span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {showChat && <ChatBox donorId={food.seller?._id || food.sellerId} foodId={food._id} donorName={food.seller?.name || 'Seller'} foodName={food.name} onClose={() => setShowChat(false)} />}
      
      {/* Payment Modal */}
      {showPayment && orderCreated && (
        <PaymentButton
          order={orderCreated}
          productName={food.name}
          amount={food.price}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
};

export default FoodCard;