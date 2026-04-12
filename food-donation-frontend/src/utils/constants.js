// ============================================
// USER ROLES (UPDATED FOR MARKETPLACE)
// ============================================

export const USER_ROLES = {
  SELLER: 'seller',
  BUYER: 'buyer',
  ADMIN: 'admin',
  // Legacy roles for backward compatibility
  DONOR: 'donor',
  RECEIVER: 'receiver'
};

export const ROLE_LABELS = {
  [USER_ROLES.SELLER]: 'Seller',
  [USER_ROLES.BUYER]: 'Buyer',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.DONOR]: 'Donor',
  [USER_ROLES.RECEIVER]: 'Receiver'
};

export const ROLE_ROUTES = {
  [USER_ROLES.SELLER]: '/donor/dashboard',
  [USER_ROLES.BUYER]: '/receiver/dashboard',
  [USER_ROLES.ADMIN]: '/admin/dashboard',
  [USER_ROLES.DONOR]: '/donor/dashboard',
  [USER_ROLES.RECEIVER]: '/receiver/dashboard'
};

// ============================================
// FOOD/PRODUCT CATEGORIES
// ============================================

export const FOOD_CATEGORIES = [
  'Indian',
  'Chinese',
  'Italian',
  'Mexican',
  'Fast Food',
  'Bakery',
  'Snacks',
  'Meals',
  'Desserts',
  'Beverages',
  'Fruits',
  'Vegetables',
  'Groceries',
  'Other'
];

export const FOOD_UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'plate', label: 'Plates' },
  { value: 'box', label: 'Boxes' },
  { value: 'packet', label: 'Packets' },
  { value: 'bottle', label: 'Bottles' },
  { value: 'piece', label: 'Pieces' },
  { value: 'serving', label: 'Servings' }
];

export const DIETARY_TYPES = [
  { value: 'veg', label: 'Vegetarian', icon: '🌱', color: 'green' },
  { value: 'non-veg', label: 'Non-Vegetarian', icon: '🍗', color: 'red' },
  { value: 'vegan', label: 'Vegan', icon: '🌿', color: 'green-600' }
];

// ============================================
// ORDER STATUS
// ============================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [ORDER_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800'
};

// ============================================
// PAYMENT STATUS
// ============================================

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PAYMENT_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [PAYMENT_STATUS.REFUNDED]: 'bg-gray-100 text-gray-800'
};

// ============================================
// PRODUCT STATUS
// ============================================

export const PRODUCT_STATUS = {
  AVAILABLE: 'available',
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

// ============================================
// SEARCH & FILTER CONSTANTS
// ============================================

export const SEARCH_RADIUS_OPTIONS = [
  { value: 5, label: 'Within 5 km', distance: 5 },
  { value: 10, label: 'Within 10 km', distance: 10 },
  { value: 15, label: 'Within 15 km', distance: 15 },
  { value: 20, label: 'Within 20 km', distance: 20 },
  { value: 30, label: 'Within 30 km', distance: 30 },
  { value: 50, label: 'Within 50 km', distance: 50 }
];

export const DIETARY_FILTERS = [
  { value: 'all', label: 'All', icon: '🍽️', color: 'gray' },
  { value: 'veg', label: 'Veg Only', icon: '🌱', color: 'green' },
  { value: 'non-veg', label: 'Non-Veg Only', icon: '🍗', color: 'red' },
  { value: 'vegan', label: 'Vegan', icon: '🌿', color: 'green-600' }
];

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance (Nearest First)' },
  { value: 'price_low', label: 'Price (Low to High)' },
  { value: 'price_high', label: 'Price (High to Low)' },
  { value: 'expiry', label: 'Expiry (Soonest First)' },
  { value: 'newest', label: 'Newest First' }
];

// ============================================
// COMMISSION & EARNINGS
// ============================================

export const COMMISSION_RATE = 0.20; // 20% platform commission

export const calculateCommission = (price) => {
  return price * COMMISSION_RATE;
};

export const calculateSellerEarning = (price) => {
  return price * (1 - COMMISSION_RATE);
};

// ============================================
// IMPACT METRICS
// ============================================

export const IMPACT_METRICS = {
  CO2_PER_KG: 2.5,
  MEALS_PER_KG: 2.5,
  WATER_PER_KG: 1000,
  ENERGY_PER_KG: 2.5,
  LAND_PER_KG: 0.5,
  CO2_PER_MEAL: 1.0,
  WATER_PER_MEAL: 400
};

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  PRODUCTS: {
    ADD: '/food',
    GET_ALL: '/food',
    GET_MINE: '/food/mine',
    GET_NEARBY: '/food/nearby',
    GET_BY_ID: '/food/:id',
    UPDATE: '/food/:id',
    DELETE: '/food/:id'
  },
  ORDERS: {
    CREATE: '/food/:id/claim',
    GET_MINE: '/claims/mine',
    ACCEPT: '/requests/:id/accept',
    REJECT: '/requests/:id/reject',
    GET_SELLER_ORDERS: '/requests/seller/orders',
    GET_BUYER_ORDERS: '/requests/receiver/claims'
  },
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    STATUS: '/payments/status/:requestId'
  },
  CHAT: {
    GET_MESSAGES: '/chat/:foodId',
    SEND: '/chat',
    MARK_READ: '/chat/:chatId/read',
    GET_LIST: '/chat/list'
  },
  DONOR: {
    STATS: '/donor/stats',
    RECENT_CLAIMS: '/donor/claims/recent'
  },
  RECEIVER: {
    STATS: '/receiver/stats',
    MY_CLAIMS: '/receiver/claims'
  }
};

// ============================================
// GEOCODING & MAP CONSTANTS
// ============================================

export const GEOCODING_SERVICES = {
  NOMINATIM: 'https://nominatim.openstreetmap.org/search',
  REVERSE_NOMINATIM: 'https://nominatim.openstreetmap.org/reverse',
  MAPBOX: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  OPENCAGE: 'https://api.opencagedata.com/geocode/v1/json'
};

export const DEFAULT_MAP_CENTER = {
  lat: 28.6139,
  lng: 77.2090
};

export const DEFAULT_ZOOM_LEVEL = 13;

// ============================================
// FORM VALIDATION CONSTANTS
// ============================================

export const VALIDATION_RULES = {
  NAME: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s\-']+$/
  },
  EMAIL: {
    pattern: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/,
    maxLength: 255
  },
  PHONE: {
    pattern: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{4}$/,
    minLength: 10,
    maxLength: 15
  },
  PASSWORD: {
    minLength: 6,
    maxLength: 100
  },
  QUANTITY: {
    min: 0.1,
    max: 1000
  },
  PRICE: {
    min: 1,
    max: 100000
  }
};

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Please login to continue',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  WEAK_PASSWORD: 'Password must be at least 6 characters',
  INVALID_EMAIL: 'Please enter a valid email address',
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_EXPIRED: 'This product has expired',
  PRODUCT_UNAVAILABLE: 'This product is no longer available',
  INVALID_PRICE: 'Please enter a valid price',
  INVALID_QUANTITY: 'Please enter a valid quantity',
  INVALID_EXPIRY: 'Expiry date must be in the future',
  IMAGE_TOO_LARGE: 'Image size should be less than 5MB',
  INVALID_IMAGE_TYPE: 'Please upload a valid image',
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  PAYMENT_VERIFICATION_FAILED: 'Payment verification failed',
  LOCATION_DENIED: 'Location permission denied',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.'
};

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REGISTER_SUCCESS: 'Account created successfully!',
  PRODUCT_ADDED: 'Product listed successfully!',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  ORDER_CREATED: 'Order created! Please complete payment.',
  ORDER_ACCEPTED: 'Order accepted! OTP generated.',
  ORDER_COMPLETED: 'Order completed successfully!',
  PAYMENT_SUCCESS: 'Payment successful! Order confirmed.',
  PROFILE_UPDATED: 'Profile updated successfully',
  LOCATION_UPDATED: 'Location updated successfully'
};

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  LAST_LOCATION: 'last_location',
  FILTERS: 'saved_filters'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const calculateDistance = (distance) => {
  if (!distance && distance !== 0) return 'Unknown';
  if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
  return `${distance.toFixed(1)}km`;
};

export default {
  USER_ROLES,
  ROLE_LABELS,
  ROLE_ROUTES,
  FOOD_CATEGORIES,
  FOOD_UNITS,
  DIETARY_TYPES,
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_COLORS,
  PRODUCT_STATUS,
  SEARCH_RADIUS_OPTIONS,
  DIETARY_FILTERS,
  SORT_OPTIONS,
  COMMISSION_RATE,
  calculateCommission,
  calculateSellerEarning,
  IMPACT_METRICS,
  API_ENDPOINTS,
  GEOCODING_SERVICES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STORAGE_KEYS,
  getRoleLabel,
  formatPrice,
  calculateDistance
};