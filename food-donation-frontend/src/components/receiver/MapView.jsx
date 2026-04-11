import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ foodItems, userLocation, onClaim }) => {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current && userLocation) {
      // Initialize map
      mapRef.current = L.map('map').setView([userLocation.lat, userLocation.lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !foodItems.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: '<div class="bg-blue-500 rounded-full w-4 h-4 border-2 border-white shadow-lg"></div>',
          iconSize: [16, 16]
        })
      }).addTo(mapRef.current);
      userMarker.bindPopup('<b>You are here</b>').openPopup();
      markersRef.current.push(userMarker);
    }

    // Add food markers
    foodItems.forEach(food => {
      const [lng, lat] = food.location.coordinates;
      const marker = L.marker([lat, lng]).addTo(mapRef.current);
      
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold">${food.name}</h3>
          <p class="text-sm">${food.quantity} ${food.unit}</p>
          <p class="text-sm text-gray-600">${food.distance.toFixed(1)} km away</p>
          <button 
            onclick="window.handleClaimClick('${food._id}')"
            class="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
          >
            Claim Food
          </button>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Expose function for popup button
    window.handleClaimClick = (foodId) => {
      onClaim(foodId);
    };

    // Fit bounds to show all markers
    if (markersRef.current.length > 1) {
      const bounds = L.latLngBounds(markersRef.current.map(m => m.getLatLng()));
      mapRef.current.fitBounds(bounds);
    }
  }, [foodItems, userLocation, onClaim]);

  return <div id="map" className="w-full h-full rounded-lg"></div>;
};

export default MapView;