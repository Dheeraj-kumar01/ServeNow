import React, { useState, useEffect } from 'react';
import { getNearbyFood, claimFood } from '../../services/food';
import { getCurrentLocation } from '../../utils/geolocation';
import FoodCard from '../../components/receiver/FoodCard';
import FilterBar from '../../components/receiver/FilterBar';
import MapView from '../../components/receiver/MapView';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { FaMap, FaList, FaRedoAlt, FaLocationArrow, FaFilter, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ReceiverDashboard = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list');
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

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchNearbyFood();
    }
  }, [userLocation, searchRadius]);

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
      let errorMessage = 'Unable to get your location. ';
      if (error.code === 1) {
        errorMessage += 'Please enable location access.';
      } else {
        errorMessage += 'Using default location.';
      }
      setLocationError(errorMessage);
      setUserLocation({ lat: 28.6139, lng: 77.2090, isDefault: true });
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchNearbyFood = async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const foods = await getNearbyFood(userLocation.lat, userLocation.lng, searchRadius);
      setFoodItems(foods);
      setLastRefresh(new Date());
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const refreshFood = async () => {
    setRefreshing(true);
    await fetchNearbyFood();
    setRefreshing(false);
    toast.success('Products refreshed');
  };

  const applyFilters = () => {
    let filtered = [...foodItems];
    if (filters.dietaryType !== 'all') {
      filtered = filtered.filter(item => item.dietaryType === filters.dietaryType);
    }
    if (filters.showUrgentOnly) {
      filtered = filtered.filter(item => item.isUrgent === true);
    }
    if (filters.maxDistance) {
      filtered = filtered.filter(item => (item.distance || 0) <= filters.maxDistance);
    }
    setFilteredItems(filtered);
  };

  const handleClaimFood = async (foodId) => {
    try {
      console.log('Creating order for product:', foodId);
      
      const response = await claimFood(foodId);
      console.log('Claim response:', response);
      
      if (response && response.order) {
        toast.success(response.message || 'Order created! Please complete payment.');
        await fetchNearbyFood();
        return response;
      } else {
        toast.error('Failed to create order');
        return null;
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
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
    setFilters({ dietaryType: 'all', maxDistance: searchRadius, showUrgentOnly: false });
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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
        <p className="text-gray-600">Getting your location...</p>
      </div>
    );
  }

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Products Nearby</h1>
            {userLocation && !userLocation.isDefault && (
              <span className="inline-flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full mt-2">
                <FaLocationArrow className="mr-1" size={12} /> Location detected
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <select value={searchRadius} onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={15}>Within 15 km</option>
              <option value={20}>Within 20 km</option>
              <option value={50}>Within 50 km</option>
            </select>
            
            <button onClick={refreshFood} disabled={refreshing}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <FaRedoAlt className={refreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            
            <button onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-green-500 text-white' : 'bg-white'}`}>
              <FaFilter /> Filters
            </button>
            
            <div className="flex gap-1 bg-white border border-gray-300 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-green-500 text-white' : ''}`}>
                <FaList />
              </button>
              <button onClick={() => setViewMode('map')} className={`p-2 ${viewMode === 'map' ? 'bg-green-500 text-white' : ''}`}>
                <FaMap />
              </button>
            </div>
          </div>
        </div>

        {showFilters && <FilterBar filters={filters} setFilters={setFilters} />}

        <div className="mt-4 flex justify-between">
          <p className="text-sm text-gray-500">Found {filteredItems.length} items within {searchRadius} km</p>
          <button onClick={clearFilters} className="text-sm text-gray-500">Clear filters</button>
        </div>

        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredItems.map(food => (
              <FoodCard key={food._id} food={food} userLocation={userLocation} 
                onClaim={handleClaimFood} onViewMap={handleViewMap} />
            ))}
          </div>
        ) : (
          <div className="mt-6 h-[600px] rounded-xl overflow-hidden shadow-lg">
            <MapView foodItems={filteredItems} userLocation={userLocation} onClaim={handleClaimFood} />
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-lg shadow mt-6">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500">No products available. Try expanding your search radius.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverDashboard;