import React from 'react';
import { FaLeaf, FaEgg, FaClock, FaTimes } from 'react-icons/fa';

const FilterBar = ({ filters, setFilters }) => {
  const handleDietaryChange = (value) => {
    setFilters({ ...filters, dietaryType: value });
  };

  const handleDistanceChange = (value) => {
    setFilters({ ...filters, maxDistance: parseInt(value) });
  };

  const handleUrgentToggle = () => {
    setFilters({ ...filters, showUrgentOnly: !filters.showUrgentOnly });
  };

  const clearFilters = () => {
    setFilters({
      dietaryType: 'all',
      maxDistance: 10,
      showUrgentOnly: false
    });
  };

  const hasActiveFilters = filters.dietaryType !== 'all' || filters.showUrgentOnly;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Dietary Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Dietary:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleDietaryChange('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filters.dietaryType === 'all'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleDietaryChange('veg')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  filters.dietaryType === 'veg'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaLeaf size={12} />
                Veg
              </button>
              <button
                onClick={() => handleDietaryChange('non-veg')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  filters.dietaryType === 'non-veg'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaEgg size={12} />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Distance Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Distance:</span>
            <select
              value={filters.maxDistance}
              onChange={(e) => handleDistanceChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={15}>Within 15 km</option>
              <option value={20}>Within 20 km</option>
              <option value={30}>Within 30 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>

          {/* Urgent Only Filter */}
          <button
            onClick={handleUrgentToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              filters.showUrgentOnly
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FaClock size={12} />
            Urgent Only
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all flex items-center gap-1"
          >
            <FaTimes size={12} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          {filters.dietaryType !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
              {filters.dietaryType === 'veg' ? <FaLeaf size={10} /> : <FaEgg size={10} />}
              {filters.dietaryType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
              <button
                onClick={() => handleDietaryChange('all')}
                className="ml-1 hover:text-green-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.showUrgentOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs">
              <FaClock size={10} />
              Urgent Only
              <button
                onClick={handleUrgentToggle}
                className="ml-1 hover:text-red-900"
              >
                ×
              </button>
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
            Within {filters.maxDistance} km
          </span>
        </div>
      )}
    </div>
  );
};

export default FilterBar;