import { differenceInMinutes, differenceInHours, formatDistanceToNow } from 'date-fns';

export const formatDistance = (distance) => {
  if (!distance && distance !== 0) return 'Unknown';
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

export const formatTimeToExpiry = (expiryDate) => {
  // Check if expiryDate is valid
  if (!expiryDate) {
    return 'Expired';
  }
  
  try {
    const now = new Date();
    let expiry;
    
    // Handle both Date objects and strings
    if (expiryDate instanceof Date) {
      expiry = expiryDate;
    } else {
      expiry = new Date(expiryDate);
    }
    
    // Check if date is valid
    if (isNaN(expiry.getTime())) {
      console.error('Invalid expiry date:', expiryDate);
      return 'Expired';
    }
    
    // Check if expiry is in the past
    if (expiry <= now) {
      return 'Expired';
    }
    
    const minutesLeft = differenceInMinutes(expiry, now);
    
    if (minutesLeft <= 0) return 'Expired';
    if (minutesLeft < 60) return `${minutesLeft} min left`;
    
    const hoursLeft = differenceInHours(expiry, now);
    if (hoursLeft < 24) return `${hoursLeft} hr left`;
    
    return formatDistanceToNow(expiry, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting expiry time:', error);
    return 'Expired';
  }
};

export const formatDateTime = (date, time) => {
  if (!date || !time) return 'Date not specified';
  
  try {
    // Check if date is already a full ISO string
    let dateStr = date;
    if (date.includes('T')) {
      dateStr = date.split('T')[0];
    }
    
    const dateTime = new Date(`${dateStr}T${time}`);
    if (isNaN(dateTime.getTime())) {
      console.error('Invalid date time:', date, time);
      return `${date} ${time}`;
    }
    return dateTime.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return `${date} ${time}`;
  }
};

export const formatDate = (date) => {
  if (!date) return 'Date not specified';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date not specified';
  }
};

export const formatTime = (time) => {
  if (!time) return 'Time not specified';
  return time;
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  
  return new Intl.NumberFormat('en-IN').format(number);
};

export const formatQuantity = (quantity, unit) => {
  if (!quantity && quantity !== 0) return '0';
  if (!unit) return `${quantity}`;
  
  return `${quantity} ${unit}`;
};

export const isFoodExpired = (expiryDate, expiryTime) => {
  if (!expiryDate || !expiryTime) return true;
  
  try {
    let dateStr = expiryDate;
    if (expiryDate.includes('T')) {
      dateStr = expiryDate.split('T')[0];
    }
    const expiryDateTime = new Date(`${dateStr}T${expiryTime}`);
    if (isNaN(expiryDateTime.getTime())) return true;
    return expiryDateTime < new Date();
  } catch (error) {
    console.error('Error checking expiry:', error);
    return true;
  }
};

export const getUrgencyLevel = (expiryDate, expiryTime) => {
  if (!expiryDate || !expiryTime) return 'expired';
  
  try {
    let dateStr = expiryDate;
    if (expiryDate.includes('T')) {
      dateStr = expiryDate.split('T')[0];
    }
    const expiryDateTime = new Date(`${dateStr}T${expiryTime}`);
    if (isNaN(expiryDateTime.getTime())) return 'expired';
    
    const hoursLeft = (expiryDateTime - new Date()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) return 'expired';
    if (hoursLeft < 1) return 'critical';
    if (hoursLeft < 3) return 'urgent';
    if (hoursLeft < 6) return 'warning';
    return 'normal';
  } catch (error) {
    return 'expired';
  }
};

export const getUrgencyColor = (level) => {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800 animate-pulse';
    case 'urgent':
      return 'bg-orange-100 text-orange-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800';
    case 'normal':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default {
  formatDistance,
  formatTimeToExpiry,
  formatDateTime,
  formatDate,
  formatTime,
  formatCurrency,
  formatNumber,
  formatQuantity,
  isFoodExpired,
  getUrgencyLevel,
  getUrgencyColor
};