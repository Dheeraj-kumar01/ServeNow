import api from './api';

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

export const addFood = async (formData) => {
  const response = await api.post('/food', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getDonorFoodListings = async () => {
  try {
    const response = await api.get('/food/mine');
    if (response.data && response.data.products && Array.isArray(response.data.products)) {
      return response.data.products;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getFoodById = async (foodId) => {
  const response = await api.get(`/food/${foodId}`);
  return response.data;
};

export const updateFood = async (foodId, formData) => {
  const response = await api.put(`/food/${foodId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteFood = async (foodId) => {
  const response = await api.delete(`/food/${foodId}`);
  return response.data;
};

// ============================================
// NEARBY PRODUCT SEARCH
// ============================================

export const getNearbyFood = async (lat, lng, radius = 10) => {
  const response = await api.get('/food/nearby', {
    params: { lat, lng, radius }
  });
  return response.data;
};

export const searchFood = async (searchParams) => {
  const response = await api.get('/food/search', { params: searchParams });
  return response.data;
};

// ============================================
// ORDER OPERATIONS
// ============================================

export const claimFood = async (foodId) => {
  const response = await api.post(`/food/${foodId}/claim`);
  return response.data;
};

export const getMyClaims = async () => {
  const response = await api.get('/claims/mine');
  return response.data;
};

export const acceptClaimRequest = async (claimId) => {
  const response = await api.put(`/requests/${claimId}/accept`);
  return response.data;
};

export const rejectClaimRequest = async (claimId) => {
  const response = await api.put(`/requests/${claimId}/reject`);
  return response.data;
};

export const generateClaimOTP = async (claimId) => {
  const response = await api.post(`/requests/${claimId}/generate-otp`);
  return response.data;
};

export const verifyClaimOTP = async (claimId, otp) => {
  const response = await api.post(`/requests/${claimId}/verify`, { otp });
  return response.data;
};

// ============================================
// SELLER STATS - FIXED WORKING VERSION
// ============================================

// Get seller dashboard stats
export const getSellerStats = async () => {
  try {
    const response = await api.get('/donor/stats');
    console.log('Seller stats response:', response.data);
    
    // Return data with proper mapping
    return {
      totalProducts: response.data.totalDonations || 0,
      totalOrders: response.data.totalOrders || 0,
      totalRevenue: response.data.totalEarnings || 0,
      totalCommission: response.data.totalCommission || 0,
      pendingOrders: response.data.pendingOrders || 0,
      completedOrders: response.data.completedDonations || 0,
      activeListings: response.data.activeListings || 0,
      totalBeneficiaries: response.data.totalBeneficiaries || 0,
      acceptedOrders: response.data.acceptedOrders || 0,
      rejectedOrders: response.data.rejectedOrders || 0
    };
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalCommission: 0,
      pendingOrders: 0,
      completedOrders: 0,
      activeListings: 0,
      totalBeneficiaries: 0,
      acceptedOrders: 0,
      rejectedOrders: 0
    };
  }
};

// Get seller orders
export const getSellerOrders = async () => {
  try {
    const response = await api.get('/donor/claims/recent');
    console.log('Seller orders response:', response.data);
    
    const orders = Array.isArray(response.data) ? response.data : [];
    
    // Calculate stats from orders
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.amount || order.food?.price || 0), 0),
      totalCommission: orders.reduce((sum, order) => sum + ((order.amount || order.food?.price || 0) * 0.2), 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      acceptedOrders: orders.filter(o => o.status === 'accepted').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      rejectedOrders: orders.filter(o => o.status === 'rejected').length
    };
    
    return { orders, stats };
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    return { 
      orders: [], 
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        pendingOrders: 0,
        acceptedOrders: 0,
        completedOrders: 0,
        rejectedOrders: 0
      } 
    };
  }
};

// Get donor stats (compatibility)
export const getDonorStats = async () => {
  try {
    const response = await api.get('/donor/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching donor stats:', error);
    return {
      totalDonations: 0,
      activeListings: 0,
      completedDonations: 0,
      totalBeneficiaries: 0
    };
  }
};

export const getDonorRecentClaims = async () => {
  try {
    const response = await api.get('/donor/claims/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching donor recent claims:', error);
    return [];
  }
};

export const getDonorAllClaims = async () => {
  try {
    const response = await api.get('/donor/claims');
    return response.data;
  } catch (error) {
    console.error('Error fetching donor all claims:', error);
    return { claims: [], total: 0, page: 1, pages: 0 };
  }
};

export const getDonorFoodItems = async () => {
  const response = await api.get('/food/mine');
  return response.data;
};

// ============================================
// PAYMENT OPERATIONS
// ============================================

export const createRazorpayOrder = async (requestId) => {
  const response = await api.post('/payments/create-order', { requestId });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await api.post('/payments/verify', paymentData);
  return response.data;
};

export const getPaymentStatus = async (requestId) => {
  const response = await api.get(`/payments/status/${requestId}`);
  return response.data;
};

// ============================================
// BUYER STATS
// ============================================

export const getReceiverStats = async () => {
  try {
    const response = await api.get('/receiver/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching receiver stats:', error);
    return {
      totalClaims: 0,
      completedClaims: 0,
      pendingClaims: 0,
      totalQuantity: 0
    };
  }
};

export const getReceiverClaims = async () => {
  try {
    const response = await api.get('/requests/receiver/claims');
    return response.data;
  } catch (error) {
    console.error('Error fetching receiver claims:', error);
    return [];
  }
};

export const getReceiverActiveClaims = async () => {
  try {
    const response = await api.get('/receiver/claims/active');
    return response.data;
  } catch (error) {
    console.error('Error fetching active claims:', error);
    return [];
  }
};

// ============================================
// IMPACT & ANALYTICS
// ============================================

export const getImpactMetrics = async () => {
  try {
    const response = await api.get('/impact/metrics');
    return response.data;
  } catch (error) {
    return { foodSaved: 0, co2Reduced: 0, mealsProvided: 0, waterSaved: 0 };
  }
};

export const getUserImpact = async () => {
  try {
    const response = await api.get('/impact/user');
    return response.data;
  } catch (error) {
    return { totalDonations: 0, totalClaims: 0, foodSaved: 0, co2Reduced: 0 };
  }
};

export const getLeaderboard = async (type = 'seller', limit = 10) => {
  try {
    const response = await api.get('/impact/leaderboard', { params: { type, limit } });
    return response.data;
  } catch (error) {
    return [];
  }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    return [];
  }
};

export const markNotificationRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// ============================================
// RATINGS & REVIEWS
// ============================================

export const submitRating = async (claimId, rating, review) => {
  const response = await api.post(`/ratings/${claimId}`, { rating, review });
  return response.data;
};

export const getUserRatings = async (userId) => {
  const response = await api.get(`/ratings/user/${userId}`);
  return response.data;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const formatFoodData = (foodData) => {
  const formData = new FormData();
  Object.keys(foodData).forEach(key => {
    if (key === 'location' && foodData[key]) {
      formData.append(key, JSON.stringify(foodData[key]));
    } else if (key === 'image' && foodData[key]) {
      formData.append(key, foodData[key]);
    } else if (foodData[key] !== null && foodData[key] !== undefined) {
      formData.append(key, foodData[key]);
    }
  });
  return formData;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isExpiringSoon = (expiryDate, expiryTime, hoursThreshold = 3) => {
  const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
  const hoursLeft = (expiryDateTime - new Date()) / (1000 * 60 * 60);
  return hoursLeft <= hoursThreshold && hoursLeft > 0;
};

export const isExpired = (expiryDate, expiryTime) => {
  const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
  return expiryDateTime < new Date();
};

export default {
  addFood,
  getDonorFoodListings,
  getFoodById,
  updateFood,
  deleteFood,
  getNearbyFood,
  searchFood,
  claimFood,
  getMyClaims,
  acceptClaimRequest,
  rejectClaimRequest,
  generateClaimOTP,
  verifyClaimOTP,
  getSellerStats,
  getSellerOrders,
  getDonorStats,
  getDonorRecentClaims,
  getDonorAllClaims,
  getDonorFoodItems,
  getReceiverStats,
  getReceiverClaims,
  getReceiverActiveClaims,
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus,
  getImpactMetrics,
  getUserImpact,
  getLeaderboard,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  submitRating,
  getUserRatings,
  formatFoodData,
  calculateDistance,
  isExpiringSoon,
  isExpired
};