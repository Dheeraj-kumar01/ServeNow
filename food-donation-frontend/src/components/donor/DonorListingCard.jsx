import React from 'react';
import { FaUser, FaPhone, FaClock } from 'react-icons/fa';

const DonorListingCard = ({ claim }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-900">{claim.food?.name}</h4>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <FaUser className="mr-1" size={12} />
            <span>{claim.receiver?.name}</span>
            <FaPhone className="ml-3 mr-1" size={12} />
            <span>{claim.receiver?.phone}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <FaClock className="mr-1" size={12} />
            <span>Claimed: {new Date(claim.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          claim.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
          claim.status === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {claim.status}
        </span>
      </div>
    </div>
  );
};

export default DonorListingCard;