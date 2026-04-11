// utils/geolocation.js
// Complete geolocation utility for Food Donation Platform

/**
 * Get current user location using browser's Geolocation API
 * @returns {Promise} Promise that resolves with position object or rejects with error
 */
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      // Check if geolocation is supported by the browser
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by your browser',
          type: 'unsupported'
        });
        return;
      }
  
      // Geolocation options for better accuracy
      const options = {
        enableHighAccuracy: true,    // Request high accuracy
        timeout: 10000,              // Maximum time to wait for location (10 seconds)
        maximumAge: 0                // Don't use cached location
      };
  
      // Request current position
      navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            },
            timestamp: position.timestamp
          });
        },
        // Error callback
        (error) => {
          let errorMessage = '';
          let errorType = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
              errorType = 'permission_denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable. Please check your GPS or try again.';
              errorType = 'position_unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please check your internet connection and try again.';
              errorType = 'timeout';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              errorType = 'unknown';
          }
          
          reject({
            code: error.code,
            message: errorMessage,
            type: errorType,
            originalError: error
          });
        },
        options
      );
    });
  };
  
  /**
   * Convert address to geographic coordinates using OpenStreetMap Nominatim API
   * @param {string} address - Full address to geocode
   * @returns {Promise} Promise that resolves with coordinates or rejects with error
   */
  export const addressToCoordinates = async (address) => {
    // Validate address
    if (!address || typeof address !== 'string') {
      throw new Error('Please provide a valid address string');
    }
    
    if (address.trim().length < 5) {
      throw new Error('Please enter a more specific address (at least 5 characters)');
    }
  
    try {
      // Encode address for URL
      const encodedAddress = encodeURIComponent(address.trim());
      
      // Nominatim API endpoint (free, no API key required)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;
      
      console.log('Geocoding address:', address);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FoodDonationApp/1.0', // Required by Nominatim terms of use
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Geocoding service error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const coordinates = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          addressDetails: result.address || {},
          boundingBox: result.boundingbox || []
        };
        
        console.log('Geocoding result:', coordinates);
        return coordinates;
      }
      
      throw new Error('Address not found. Please try a more specific address.');
      
    } catch (error) {
      console.error('Geocoding error:', error);
      
      // Provide user-friendly error message
      if (error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw error;
    }
  };
  
  /**
   * Convert coordinates to address using OpenStreetMap Nominatim reverse geocoding
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise} Promise that resolves with address string or null
   */
  export const reverseGeocode = async (lat, lng) => {
    // Validate coordinates
    if (!lat || !lng || typeof lat !== 'number' || typeof lng !== 'number') {
      console.error('Invalid coordinates for reverse geocoding:', { lat, lng });
      return null;
    }
  
    try {
      // Nominatim reverse geocoding endpoint
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      
      console.log('Reverse geocoding coordinates:', { lat, lng });
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FoodDonationApp/1.0',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Reverse geocoding service error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        const addressData = {
          fullAddress: data.display_name,
          road: data.address?.road || '',
          city: data.address?.city || data.address?.town || data.address?.village || '',
          state: data.address?.state || '',
          country: data.address?.country || '',
          postcode: data.address?.postcode || ''
        };
        
        console.log('Reverse geocoding result:', addressData);
        return addressData.fullAddress;
      }
      
      return null;
      
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };
  
  /**
   * Calculate distance between two geographic points (Haversine formula)
   * @param {number} lat1 - Latitude of first point
   * @param {number} lon1 - Longitude of first point
   * @param {number} lat2 - Latitude of second point
   * @param {number} lon2 - Longitude of second point
   * @returns {number} Distance in kilometers
   */
  export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Validate inputs
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      console.error('Invalid coordinates for distance calculation');
      return 0;
    }
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  };
  
  /**
   * Get user's city from coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise} Promise that resolves with city name
   */
  export const getCityFromCoordinates = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FoodDonationApp/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get city');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        return data.address.city || data.address.town || data.address.village || data.address.state || 'Unknown';
      }
      
      return 'Unknown';
    } catch (error) {
      console.error('Error getting city:', error);
      return 'Unknown';
    }
  };
  
  /**
   * Format distance for display
   * @param {number} distance - Distance in kilometers
   * @returns {string} Formatted distance string
   */
  export const formatDistance = (distance) => {
    if (!distance && distance !== 0) return 'Unknown';
    
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };
  
  /**
   * Validate if coordinates are within reasonable range
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean} True if coordinates are valid
   */
  export const isValidCoordinates = (lat, lng) => {
    // Valid latitude range: -90 to 90
    // Valid longitude range: -180 to 180
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };
  
  /**
   * Get user-friendly location error message
   * @param {Object} error - Error object from getCurrentLocation
   * @returns {string} User-friendly error message
   */
  export const getLocationErrorMessage = (error) => {
    if (!error) return 'Unable to get location';
    
    switch (error.type) {
      case 'permission_denied':
        return 'Location access denied. Please enable location in browser settings.';
      case 'position_unavailable':
        return 'Unable to detect location. Please check your GPS or Wi-Fi.';
      case 'timeout':
        return 'Location request timed out. Please try again.';
      case 'unsupported':
        return 'Geolocation is not supported by your browser.';
      default:
        return error.message || 'Unable to get location. Please try again.';
    }
  };
  
  // Export all functions as default object for convenience
  export default {
    getCurrentLocation,
    addressToCoordinates,
    reverseGeocode,
    calculateDistance,
    getCityFromCoordinates,
    formatDistance,
    isValidCoordinates,
    getLocationErrorMessage
  };