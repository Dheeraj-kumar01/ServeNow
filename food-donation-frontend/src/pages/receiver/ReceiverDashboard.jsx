import React, { useState, useEffect, useCallback } from 'react';
import { getNearbyFood, claimFood } from '../../services/food';
import { getCurrentLocation } from '../../utils/geolocation';
import FoodCard from '../../components/receiver/FoodCard';
import FilterBar from '../../components/receiver/FilterBar';
import MapView from '../../components/receiver/MapView';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { FaMap, FaList, FaRedoAlt, FaLocationArrow, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReceiverDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dietaryType: 'all',
    maxDistance: 10,
    showUrgentOnly: false
  });
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Initialize location on mount
  useEffect(() => {
    initializeLocation();
  }, []);

  // Fetch food when location is available
  useEffect(() => {
    if (userLocation) {
      fetchNearbyFood();
    }
  }, [userLocation, searchRadius]);

  // Apply filters when food items or filters change
  useEffect(() => {
    applyFilters();
  }, [filters, foodItems]);

  const initializeLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await getCurrentLocation();
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setLocationError(null);
      toast.success('Location detected successfully');
    } catch (error) {
      console.error('Location error:', error);
      let errorMessage = 'Unable to get your location. ';
      
      if (error.code === 1) {
        errorMessage += 'Please enable location access in your browser settings.';
      } else if (error.code === 2) {
        errorMessage += 'Location information is unavailable.';
      } else if (error.code === 3) {
        errorMessage += 'Location request timed out. Please try again.';
      } else {
        errorMessage += 'Please check your location settings.';
      }
      
      setLocationError(errorMessage);
      toast.error(errorMessage);
      
      // Set default location (optional - e.g., city center)
      setUserLocation({
        lat: 28.6139, // Default to New Delhi
        lng: 77.2090,
        isDefault: true
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchNearbyFood = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      const foods = await getNearbyFood(
        userLocation.lat, 
        userLocation.lng, 
        searchRadius
      );
      setFoodItems(foods);
      setLastRefresh(new Date());
      
      if (foods.length === 0) {
        toast.success('No food found nearby. Try expanding your search radius.');
      }
    } catch (error) {
      console.error('Error fetching food:', error);
      toast.error('Failed to load nearby food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshFood = async () => {
    setRefreshing(true);
    await fetchNearbyFood();
    setRefreshing(false);
    toast.success('Food list refreshed');
  };

  const applyFilters = () => {
    let filtered = [...foodItems];

    // Filter by dietary type
    if (filters.dietaryType !== 'all') {
      filtered = filtered.filter(item => item.dietaryType === filters.dietaryType);
    }

    // Filter by urgency
    if (filters.showUrgentOnly) {
      filtered = filtered.filter(item => item.isUrgent === true);
    }

    // Filter by distance (already filtered by API, but double-check)
    if (filters.maxDistance) {
      filtered = filtered.filter(item => (item.distance || 0) <= filters.maxDistance);
    }

    setFilteredItems(filtered);
  };

  const handleClaimFood = async (foodId) => {
    try {
      await claimFood(foodId);
      toast.success('Food claimed successfully! Check your dashboard for details.');
      await fetchNearbyFood(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error claiming food:', error);
      const errorMsg = error.response?.data?.message || 'Failed to claim food';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleViewMap = (food) => {
    setSelectedFood(food);
    setViewMode('map');
  };

  const handleRadiusChange = (newRadius) => {
    setSearchRadius(newRadius);
    setFilters({ ...filters, maxDistance: newRadius });
  };

  const clearFilters = () => {
    setFilters({
      dietaryType: 'all',
      maxDistance: searchRadius,
      showUrgentOnly: false
    });
    setShowFilters(false);
    toast.success('Filters cleared');
  };

  const formatLastRefresh = () => {
    const diff = Math.floor((new Date() - lastRefresh) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  if (locationLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Getting your location...</p>
        <p className="text-sm text-gray-400 mt-2">Please allow location access</p>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Food Nearby</h1>
            <p className="text-gray-600 mt-1 flex items-center gap-2">
              Discover available food donations in your area
              {userLocation && !userLocation.isDefault && (
                <span className="inline-flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <FaLocationArrow className="mr-1" size={12} />
                  Location detected
                </span>
              )}
              {userLocation?.isDefault && (
                <span className="inline-flex items-center text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                  <FaLocationArrow className="mr-1" size={12} />
                  Using default location
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Search Radius Selector */}
            <select
              value={searchRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={15}>Within 15 km</option>
              <option value={20}>Within 20 km</option>
              <option value={50}>Within 50 km</option>
            </select>
            
            <button
              onClick={refreshFood}
              disabled={refreshing}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FaRedoAlt className={`${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters || filters.dietaryType !== 'all' || filters.showUrgentOnly
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaFilter />
              Filters
              {(filters.dietaryType !== 'all' || filters.showUrgentOnly) && (
                <span className="bg-white text-green-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {(filters.dietaryType !== 'all' ? 1 : 0) + (filters.showUrgentOnly ? 1 : 0)}
                </span>
              )}
            </button>
            
            <div className="flex gap-1 bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="List view"
              >
                <FaList size={18} />
              </button>
              
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-green-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                title="Map view"
              >
                <FaMap size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Location Error Banner */}
        {locationError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-yellow-800 font-medium">Location Issue</p>
                <p className="text-yellow-700 text-sm mt-1">{locationError}</p>
              </div>
              <button
                onClick={initializeLocation}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filter Bar (Expandable) */}
        {showFilters && (
          <div className="mb-4 animate-slide-down">
            <FilterBar filters={filters} setFilters={setFilters} />
            <div className="flex justify-end mt-2">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <FaTimes size={12} />
                Clear all filters
              </button>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-500">
              Found <span className="font-semibold text-gray-700">{filteredItems.length}</span> {filteredItems.length === 1 ? 'item' : 'items'} 
              {searchRadius && ` within ${searchRadius} km`}
            </p>
            <div className="w-px h-4 bg-gray-300"></div>
            <p className="text-xs text-gray-400">
              Last updated: {formatLastRefresh()}
            </p>
          </div>
          
          {filteredItems.length === 0 && !loading && (
            <button
              onClick={() => handleRadiusChange(searchRadius + 5)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Expand search radius
            </button>
          )}
        </div>

        {/* Main Content */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredItems.map(food => (
              <FoodCard
                key={food._id}
                food={food}
                userLocation={userLocation}
                onClaim={handleClaimFood}
                onViewMap={handleViewMap}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 h-[600px] rounded-xl overflow-hidden shadow-lg bg-white">
            <MapView
              foodItems={filteredItems}
              userLocation={userLocation}
              onClaim={handleClaimFood}
              selectedFood={selectedFood}
              onFoodSelect={setSelectedFood}
            />
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm mt-6">
            <div className="text-7xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No food available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchRadius <= 10 
                ? `No food donations found within ${searchRadius} km. Try expanding your search radius.`
                : 'No food donations available in your area at the moment. Check back later!'}
            </p>
            <div className="flex gap-3 justify-center mt-6">
              {searchRadius <= 10 && (
                <button
                  onClick={() => handleRadiusChange(searchRadius + 5)}
                  className="btn-primary"
                >
                  Search Wider Area
                </button>
              )}
              <button
                onClick={refreshFood}
                className="btn-secondary flex items-center gap-2"
              >
                <FaRedoAlt />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Stats Section (Optional) */}
        {filteredItems.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex flex-wrap justify-around gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{filteredItems.length}</p>
                <p className="text-sm text-gray-500">Available Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredItems.filter(item => item.isUrgent).length}
                </p>
                <p className="text-sm text-gray-500">Urgent Items</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredItems.filter(item => item.dietaryType === 'veg').length}
                </p>
                <p className="text-sm text-gray-500">Veg Options</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.min(...filteredItems.map(item => item.distance || 999)).toFixed(1)} km
                </p>
                <p className="text-sm text-gray-500">Closest Item</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverDashboard;