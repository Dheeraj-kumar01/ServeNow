// ============================================
// FOOD RELATED CONSTANTS
// ============================================

export const FOOD_CATEGORIES = [
    'Indian',
    'Chinese',
    'Italian',
    'Mexican',
    'Thai',
    'Japanese',
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
  
  export const EXPIRY_OPTIONS = [
    { label: 'Within 1 hour', value: 60, minutes: 60 },
    { label: 'Within 3 hours', value: 180, minutes: 180 },
    { label: 'Within 6 hours', value: 360, minutes: 360 },
    { label: 'Within 12 hours', value: 720, minutes: 720 },
    { label: 'Within 24 hours', value: 1440, minutes: 1440 },
    { label: 'Within 2 days', value: 2880, minutes: 2880 },
    { label: 'Custom', value: 0, minutes: 0 }
  ];
  
  // ============================================
  // CLAIM & STATUS CONSTANTS
  // ============================================
  
  export const CLAIM_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  };
  
  export const FOOD_STATUS = {
    AVAILABLE: 'available',
    CLAIMED: 'claimed',
    PENDING: 'pending',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled'
  };
  
  export const STATUS_COLORS = {
    [CLAIM_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [CLAIM_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800',
    [CLAIM_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [CLAIM_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
    [CLAIM_STATUS.EXPIRED]: 'bg-gray-100 text-gray-800',
    [CLAIM_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
    [FOOD_STATUS.AVAILABLE]: 'bg-green-100 text-green-800',
    [FOOD_STATUS.CLAIMED]: 'bg-yellow-100 text-yellow-800',
    [FOOD_STATUS.PENDING]: 'bg-orange-100 text-orange-800',
    [FOOD_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
    [FOOD_STATUS.EXPIRED]: 'bg-gray-100 text-gray-800'
  };
  
  export const STATUS_ICONS = {
    [CLAIM_STATUS.PENDING]: '⏳',
    [CLAIM_STATUS.ACCEPTED]: '✅',
    [CLAIM_STATUS.REJECTED]: '❌',
    [CLAIM_STATUS.COMPLETED]: '🎉',
    [CLAIM_STATUS.EXPIRED]: '⏰',
    [FOOD_STATUS.AVAILABLE]: '🟢',
    [FOOD_STATUS.CLAIMED]: '📦',
    [FOOD_STATUS.COMPLETED]: '✓'
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
    { value: 'expiry', label: 'Expiry (Soonest First)' },
    { value: 'quantity', label: 'Quantity (Largest First)' },
    { value: 'newest', label: 'Newest First' }
  ];
  
  // ============================================
  // IMPACT METRICS
  // ============================================
  
  export const IMPACT_METRICS = {
    CO2_PER_KG: 2.5,        // kg CO2 saved per kg of food
    MEALS_PER_KG: 2.5,       // approximate meals per kg
    WATER_PER_KG: 1000,      // liters of water saved per kg
    ENERGY_PER_KG: 2.5,      // kWh energy saved per kg
    LAND_PER_KG: 0.5,        // square meters of land saved per kg
    CO2_PER_MEAL: 1.0,       // kg CO2 saved per meal
    WATER_PER_MEAL: 400      // liters of water saved per meal
  };
  
  // ============================================
  // URL & API CONSTANTS
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
    FOOD: {
      ADD: '/food',
      GET_ALL: '/food',
      GET_MINE: '/food/mine',
      GET_NEARBY: '/food/nearby',
      GET_BY_ID: '/food/:id',
      UPDATE: '/food/:id',
      DELETE: '/food/:id',
      CLAIM: '/food/:id/claim'
    },
    CLAIMS: {
      GET_ALL: '/claims',
      GET_MINE: '/claims/mine',
      ACCEPT: '/claims/:id/accept',
      REJECT: '/claims/:id/reject',
      GENERATE_OTP: '/claims/:id/generate-otp',
      VERIFY_OTP: '/claims/:id/verify',
      COMPLETE: '/claims/:id/complete'
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
    lat: 28.6139,  // New Delhi (default)
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
    }
  };
  
  // ============================================
  // ERROR MESSAGES
  // ============================================
  
  export const ERROR_MESSAGES = {
    // Auth errors
    AUTH_REQUIRED: 'Please login to continue',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already registered',
    WEAK_PASSWORD: 'Password must be at least 6 characters',
    INVALID_EMAIL: 'Please enter a valid email address',
    
    // Food errors
    FOOD_NOT_FOUND: 'Food item not found',
    FOOD_EXPIRED: 'This food has expired',
    FOOD_ALREADY_CLAIMED: 'This food has already been claimed',
    INVALID_QUANTITY: 'Please enter a valid quantity',
    INVALID_EXPIRY: 'Expiry date must be in the future',
    IMAGE_TOO_LARGE: 'Image size should be less than 5MB',
    INVALID_IMAGE_TYPE: 'Please upload a valid image (JPEG, PNG, GIF)',
    
    // Claim errors
    CLAIM_NOT_FOUND: 'Claim not found',
    ALREADY_CLAIMED: 'You have already claimed this food',
    CLAIM_EXPIRED: 'This claim has expired',
    INVALID_OTP: 'Invalid OTP',
    OTP_EXPIRED: 'OTP has expired',
    
    // Location errors
    LOCATION_DENIED: 'Location permission denied. Please enable location access.',
    LOCATION_UNAVAILABLE: 'Location information unavailable',
    LOCATION_TIMEOUT: 'Location request timed out',
    
    // Network errors
    NETWORK_ERROR: 'Network error. Please check your connection.',
    SERVER_ERROR: 'Server error. Please try again later.',
    
    // General errors
    SOMETHING_WRONG: 'Something went wrong. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found'
  };
  
  // ============================================
  // SUCCESS MESSAGES
  // ============================================
  
  export const SUCCESS_MESSAGES = {
    // Auth
    LOGIN_SUCCESS: 'Login successful! Welcome back.',
    LOGOUT_SUCCESS: 'Logged out successfully',
    REGISTER_SUCCESS: 'Account created successfully!',
    
    // Food
    FOOD_ADDED: 'Food listed successfully!',
    FOOD_UPDATED: 'Food updated successfully',
    FOOD_DELETED: 'Food deleted successfully',
    
    // Claim
    CLAIM_SUCCESS: 'Food claimed successfully!',
    CLAIM_ACCEPTED: 'Claim accepted!',
    CLAIM_REJECTED: 'Claim rejected',
    OTP_VERIFIED: 'OTP verified! Transaction completed.',
    OTP_GENERATED: 'OTP generated successfully',
    
    // Chat
    MESSAGE_SENT: 'Message sent',
    
    // General
    PROFILE_UPDATED: 'Profile updated successfully',
    LOCATION_UPDATED: 'Location updated successfully'
  };
  
  // ============================================
  // UI CONSTANTS
  // ============================================
  
  export const THEME_COLORS = {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    }
  };
  
  export const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };
  
  export const ANIMATION_DURATIONS = {
    fast: 150,
    normal: 300,
    slow: 500
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
  // ROLE CONSTANTS
  // ============================================
  
  export const USER_ROLES = {
    DONOR: 'donor',
    RECEIVER: 'receiver',
    ADMIN: 'admin'
  };
  
  export const ROLE_LABELS = {
    [USER_ROLES.DONOR]: 'Donor',
    [USER_ROLES.RECEIVER]: 'Receiver',
    [USER_ROLES.ADMIN]: 'Administrator'
  };
  
  export const ROLE_ROUTES = {
    [USER_ROLES.DONOR]: '/donor/dashboard',
    [USER_ROLES.RECEIVER]: '/receiver/dashboard',
    [USER_ROLES.ADMIN]: '/admin/dashboard'
  };
  
  // ============================================
  // CHAT CONSTANTS
  // ============================================
  
  export const MESSAGE_STATUS = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    ERROR: 'error'
  };
  
  export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    LOCATION: 'location',
    SYSTEM: 'system'
  };
  
  // ============================================
  // NOTIFICATION CONSTANTS
  // ============================================
  
  export const NOTIFICATION_TYPES = {
    CLAIM_REQUEST: 'claim_request',
    CLAIM_ACCEPTED: 'claim_accepted',
    CLAIM_REJECTED: 'claim_rejected',
    CLAIM_COMPLETED: 'claim_completed',
    NEW_MESSAGE: 'new_message',
    FOOD_EXPIRING: 'food_expiring',
    FOOD_CLAIMED: 'food_claimed'
  };
  
  // ============================================
  // DATE & TIME FORMATS
  // ============================================
  
  export const DATE_FORMATS = {
    FULL: 'MMMM do, yyyy',
    SHORT: 'MMM dd, yyyy',
    TIME: 'hh:mm a',
    DATE_TIME: 'MMM dd, yyyy hh:mm a',
    API: 'yyyy-MM-dd',
    API_TIME: 'HH:mm'
  };
  
  // ============================================
  // PAGINATION
  // ============================================
  
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMIT_OPTIONS: [5, 10, 20, 50]
  };
  
  // ============================================
  // FILE UPLOAD CONSTANTS
  // ============================================
  
  export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_FILES: 5
  };
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  // Get status color by status value
  export const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };
  
  // Get status icon by status value
  export const getStatusIcon = (status) => {
    return STATUS_ICONS[status] || '📋';
  };
  
  // Get role label
  export const getRoleLabel = (role) => {
    return ROLE_LABELS[role] || role;
  };
  
  // Get dietary type label
  export const getDietaryLabel = (type) => {
    const dietary = DIETARY_TYPES.find(d => d.value === type);
    return dietary ? dietary.label : type;
  };
  
  // Get category label (for display)
  export const getCategoryLabel = (category) => {
    return category || 'Other';
  };
  
  // Format distance for display
  export const formatDistance = (distance) => {
    if (!distance && distance !== 0) return 'Unknown';
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m`;
    return `${distance.toFixed(1)}km`;
  };
  
  // Check if food is urgent
  export const isUrgent = (expiryDate, expiryTime) => {
    if (!expiryDate || !expiryTime) return false;
    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
    const hoursLeft = (expiryDateTime - new Date()) / (1000 * 60 * 60);
    return hoursLeft < 3;
  };
  
  // Get urgency level
  export const getUrgencyLevel = (expiryDate, expiryTime) => {
    if (!expiryDate || !expiryTime) return 'normal';
    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
    const hoursLeft = (expiryDateTime - new Date()) / (1000 * 60 * 60);
    
    if (hoursLeft < 1) return 'critical';
    if (hoursLeft < 3) return 'urgent';
    if (hoursLeft < 6) return 'warning';
    return 'normal';
  };
  
  export default {
    FOOD_CATEGORIES,
    FOOD_UNITS,
    DIETARY_TYPES,
    EXPIRY_OPTIONS,
    CLAIM_STATUS,
    FOOD_STATUS,
    STATUS_COLORS,
    STATUS_ICONS,
    SEARCH_RADIUS_OPTIONS,
    DIETARY_FILTERS,
    SORT_OPTIONS,
    IMPACT_METRICS,
    API_ENDPOINTS,
    GEOCODING_SERVICES,
    VALIDATION_RULES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    THEME_COLORS,
    BREAKPOINTS,
    STORAGE_KEYS,
    USER_ROLES,
    ROLE_LABELS,
    ROLE_ROUTES,
    MESSAGE_STATUS,
    MESSAGE_TYPES,
    NOTIFICATION_TYPES,
    DATE_FORMATS,
    PAGINATION,
    FILE_UPLOAD,
    getStatusColor,
    getStatusIcon,
    getRoleLabel,
    getDietaryLabel,
    getCategoryLabel,
    formatDistance,
    isUrgent,
    getUrgencyLevel
  };