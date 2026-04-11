import api from './api';

// ============================================
// FOOD ITEM CRUD OPERATIONS
// ============================================

export const addFood = async (formData) => {
  const response = await api.post('/food', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getDonorFoodListings = async () => {
  const response = await api.get('/food/mine');
  return response.data;
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
// NEARBY FOOD SEARCH
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
// CLAIM OPERATIONS
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

// ============================================
// OTP OPERATIONS
// ============================================

export const generateClaimOTP = async (claimId) => {
  const response = await api.post(`/requests/${claimId}/generate-otp`);
  return response.data;
};

export const resendOTP = async (claimId) => {
  const response = await api.post(`/requests/${claimId}/resend-otp`);
  return response.data;
};

export const verifyClaimOTP = async (claimId, otp) => {
  const response = await api.post(`/requests/${claimId}/verify`, { otp });
  return response.data;
};

export const updateClaimStatus = async (claimId, status) => {
  const response = await api.put(`/requests/${claimId}/status`, { status });
  return response.data;
};

export const completeClaim = async (claimId) => {
  const response = await api.put(`/requests/${claimId}/complete`);
  return response.data;
};

// ============================================
// DONOR SPECIFIC OPERATIONS
// ============================================

export const getDonorStats = async () => {
  const response = await api.get('/donor/stats');
  return response.data;
};

export const getDonorRecentClaims = async () => {
  const response = await api.get('/donor/claims/recent');
  return response.data;
};

export const getDonorAllClaims = async () => {
  const response = await api.get('/donor/claims');
  return response.data;
};

export const getDonorFoodItems = async () => {
  const response = await api.get('/food/mine');
  return response.data;
};

// ============================================
// RECEIVER SPECIFIC OPERATIONS
// ============================================

export const getReceiverStats = async () => {
  const response = await api.get('/receiver/stats');
  return response.data;
};

export const getReceiverClaims = async () => {
  const response = await api.get('/requests/receiver/claims');
  return response.data;
};

export const getReceiverActiveClaims = async () => {
  const response = await api.get('/receiver/claims/active');
  return response.data;
};

// ============================================
// IMPACT & ANALYTICS
// ============================================

export const getImpactMetrics = async () => {
  const response = await api.get('/impact/metrics');
  return response.data;
};

export const getUserImpact = async () => {
  const response = await api.get('/impact/user');
  return response.data;
};

export const getLeaderboard = async (type = 'donor', limit = 10) => {
  const response = await api.get('/impact/leaderboard', {
    params: { type, limit }
  });
  return response.data;
};

// ============================================
// NOTIFICATIONS
// ============================================

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
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
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
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
  resendOTP,
  verifyClaimOTP,
  updateClaimStatus,
  completeClaim,
  getDonorStats,
  getDonorRecentClaims,
  getDonorAllClaims,
  getDonorFoodItems,
  getReceiverStats,
  getReceiverClaims,
  getReceiverActiveClaims,
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