import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { FaUser, FaEnvelope, FaLock, FaStore, FaHandHoldingHeart, FaPhone, FaMapMarkerAlt, FaLocationArrow, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'receiver',
    phone: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { location, loading: locationLoading, error: locationError, retry: retryLocation } = useGeolocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location) {
      console.log('Location captured:', location);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    if (!formData.address.trim()) {
      toast.error('Please enter your address');
      return;
    }
    
    setLoading(true);
    
    try {
      let locationData = null;
      
      if (location && location.lat && location.lng) {
        locationData = {
          lat: location.lat,
          lng: location.lng
        };
        console.log('Sending location to backend:', locationData);
      }
      
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        address: formData.address,
        location: locationData
      };
      
      console.log('Registering user with data:', {
        ...userData,
        password: '***HIDDEN***'
      });
      
      const result = await signup(userData);
      
      if (result && result.success) {
        toast.success('Account created successfully!');
        
        if (result.user && result.user.role === 'donor') {
          navigate('/donor/dashboard');
        } else if (result.user && result.user.role === 'receiver') {
          navigate('/receiver/dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast.error(result?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join us in fighting food waste and hunger
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1234567890"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">10-digit mobile number</p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your full address (street, city, pincode)"
                />
              </div>
            </div>

            {/* Location Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaLocationArrow className="text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Location</span>
                </div>
                {locationLoading ? (
                  <div className="flex items-center text-sm text-gray-500">
                    <FaSpinner className="animate-spin mr-1" />
                    Getting location...
                  </div>
                ) : location ? (
                  <div className="text-sm text-green-600">
                    ✓ Location detected
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={retryLocation}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Enable Location
                  </button>
                )}
              </div>
              {location && (
                <p className="text-xs text-gray-500 mt-1">
                  Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                </p>
              )}
              {locationError && (
                <p className="text-xs text-red-500 mt-1">
                  {locationError}. You can still register without location.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Location helps find nearby food donations
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  minLength="6"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a: *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'donor' })}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                    formData.role === 'donor' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaStore className={`text-2xl ${formData.role === 'donor' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="mt-2 text-sm font-medium">Seller</span>
                  <span className="text-xs text-gray-500">Restaurant/Individual</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'receiver' })}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center transition-all ${
                    formData.role === 'receiver' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <FaHandHoldingHeart className={`text-2xl ${formData.role === 'receiver' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="mt-2 text-sm font-medium">Buyer</span>
                  <span className="text-xs text-gray-500">NGO/Orphanage/Individual</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-green-600 hover:text-green-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;