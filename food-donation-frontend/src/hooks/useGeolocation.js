import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setPermission('unsupported');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    // Default options
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    };

    // Get current position
    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setLocation({
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            timestamp: position.timestamp
          });
          setError(null);
          setLoading(false);
          setPermission('granted');
        },
        (err) => {
          let errorMessage = '';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              setPermission('denied');
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          setError(errorMessage);
          setLoading(false);
          toast.error(errorMessage);
        },
        defaultOptions
      );
    };

    // Check if permission was previously granted
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        getLocation();
      } else if (result.state === 'prompt') {
        getLocation();
      } else {
        setLoading(false);
        setPermission('denied');
      }
    }).catch(() => {
      getLocation(); // Fallback if permissions API is not supported
    });

    // Cleanup
    return () => {
      // No cleanup needed for geolocation
    };
  }, []);

  // Function to manually retry getting location
  const retry = () => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setError(null);
          setLoading(false);
          setPermission('granted');
          toast.success('Location updated successfully');
        },
        (err) => {
          setError('Failed to get location. Please check permissions.');
          setLoading(false);
          toast.error('Failed to get location');
        }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  };

  return { 
    location, 
    error, 
    loading, 
    permission,
    retry,
    hasLocation: !!location,
    isSupported: !!navigator.geolocation
  };
};