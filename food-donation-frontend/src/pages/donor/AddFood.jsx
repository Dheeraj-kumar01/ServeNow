import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addFood } from '../../services/food';
import { getCurrentLocation, addressToCoordinates } from '../../utils/geolocation';
import { FOOD_CATEGORIES, DIETARY_TYPES, FOOD_UNITS } from '../../utils/constants';
import { FaImage, FaMapMarkerAlt, FaUtensils, FaClock, FaUsers, FaTrash, FaSpinner, FaLocationArrow, FaRupeeSign } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AddFood = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'kg',
    price: '',  // <-- NEW: Price field
    description: '',
    expiryDate: '',
    expiryTime: '',
    pickupAddress: '',
    location: { lat: null, lng: null },
    dietaryType: 'veg',
    image: null,
    isUrgent: false
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = async () => {
    setGettingLocation(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      
      setFormData(prev => ({
        ...prev,
        location: { lat: latitude, lng: longitude }
      }));
      
      try {
        const address = await reverseGeocode(latitude, longitude);
        if (address) {
          setFormData(prev => ({
            ...prev,
            pickupAddress: address
          }));
          toast.success('Location captured successfully!');
        } else {
          toast.success('Location captured! Please enter your address manually.');
        }
      } catch (addressError) {
        toast.success('Location captured! Please enter your address manually.');
      }
    } catch (error) {
      let errorMessage = 'Unable to get location. ';
      if (error.code === 1) {
        errorMessage += 'Please allow location access in your browser settings.';
      } else if (error.code === 2) {
        errorMessage += 'Location information is unavailable.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please check your location settings and try again.';
      }
      toast.error(errorMessage);
    } finally {
      setGettingLocation(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'FoodDonationApp/1.0' } }
      );
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      return null;
    }
  };

  const handleAddressLookup = async () => {
    const address = formData.pickupAddress;
    if (!address || address.trim().length < 5) {
      toast.error('Please enter a valid address (at least 5 characters)');
      return;
    }
    setGettingLocation(true);
    try {
      const coords = await addressToCoordinates(address);
      if (coords && coords.lat && coords.lng) {
        setFormData(prev => ({
          ...prev,
          location: { lat: coords.lat, lng: coords.lng }
        }));
        toast.success('Location found!');
      } else {
        toast.error('Could not find location for this address.');
      }
    } catch (error) {
      toast.error('Could not find location. Please check the address.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.quantity || !formData.expiryDate || !formData.expiryTime) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price (₹1 or more)');
      return;
    }

    if (!formData.pickupAddress) {
      toast.error('Please enter pickup address');
      return;
    }

    if (!formData.location.lat || !formData.location.lng) {
      toast.error('Please provide location. Click "Get Location" or search address.');
      return;
    }

    setLoading(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image' && formData[key]) {
          data.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined && key !== 'confirmPassword') {
          data.append(key, formData[key]);
        }
      });

      await addFood(data);
      toast.success('Product listed successfully!');
      navigate('/donor/listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to list product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">List New Product</h1>
            <p className="text-green-100 mt-1">Sell your surplus food items</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Biryani, Pizza, Sandwiches"
                required
              />
            </div>

            {/* Category and Dietary Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select category</option>
                  {FOOD_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Type *</label>
                <div className="flex gap-4">
                  {DIETARY_TYPES.map(type => (
                    <label key={type.value} className="flex items-center">
                      <input
                        type="radio"
                        name="dietaryType"
                        value={type.value}
                        checked={formData.dietaryType === type.value}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span>{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 5"
                  step="0.1"
                  min="0.1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {FOOD_UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Field - NEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) * <span className="text-xs text-gray-500">(Platform commission: 20%)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaRupeeSign className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter price"
                  step="1"
                  min="1"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You will receive 80% (₹{(parseFloat(formData.price) * 0.8).toFixed(2) || '0'}) after successful delivery
              </p>
            </div>

            {/* Expiry Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Time *</label>
                <input
                  type="time"
                  name="expiryTime"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe your product, ingredients, etc."
              />
            </div>

            {/* Location Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">Pickup Location *</label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your full address"
                  required
                />
                <button
                  type="button"
                  onClick={handleAddressLookup}
                  disabled={gettingLocation || !formData.pickupAddress}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {gettingLocation ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />}
                  Search
                </button>
              </div>
              
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {gettingLocation ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <FaLocationArrow />
                    Use My Current Location
                  </>
                )}
              </button>
              
              {formData.location.lat && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-700">
                    ✓ Location captured ({formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)})
                  </p>
                </div>
              )}
            </div>

            {/* Urgent Flag */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Mark as Urgent (Product will expire soon)</span>
              </label>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <FaImage />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/donor/dashboard')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaRupeeSign />}
                {loading ? 'Listing Product...' : 'List Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFood;