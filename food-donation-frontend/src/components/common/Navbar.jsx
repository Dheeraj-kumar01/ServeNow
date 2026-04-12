import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaUtensils, 
  FaSignOutAlt, 
  FaUser, 
  FaList, 
  FaPlus, 
  FaClipboardList,
  FaTruck,
  FaStore,
  FaComments,
  FaShoppingCart,
  FaRupeeSign
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FaUtensils className="text-green-600 text-2xl" />
              <span className="font-bold text-xl text-gray-900">FoodShare</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Name */}
                <span className="text-gray-700 text-sm hidden md:inline">
                  Welcome, {user.name}
                </span>

                {/* Seller Navigation (formerly Donor) */}
                {(user.role === 'seller' || user.role === 'donor') && (
                  <>
                    <Link
                      to="/donor/dashboard"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="Dashboard"
                    >
                      <FaUser size={14} />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                    <Link
                      to="/donor/add-food"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="Add Product"
                    >
                      <FaPlus size={14} />
                      <span className="hidden sm:inline">Add Product</span>
                    </Link>
                    <Link
                      to="/donor/listings"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="My Products"
                    >
                      <FaList size={14} />
                      <span className="hidden sm:inline">My Products</span>
                    </Link>
                    {/* NEW: Orders Link for Seller */}
                    <Link
                      to="/donor/orders"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="My Orders"
                    >
                      <FaShoppingCart size={14} />
                      <span className="hidden sm:inline">Orders</span>
                    </Link>
                    <Link
                      to="/donor/chat"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="Messages"
                    >
                      <FaComments size={14} />
                      <span className="hidden sm:inline">Messages</span>
                    </Link>
                  </>
                )}

                {/* Buyer Navigation (formerly Receiver) */}
                {(user.role === 'buyer' || user.role === 'receiver') && (
                  <>
                    <Link
                      to="/receiver/dashboard"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="Browse Products"
                    >
                      <FaTruck size={14} />
                      <span className="hidden sm:inline">Browse</span>
                    </Link>
                    {/* NEW: My Orders Link for Buyer */}
                    <Link
                      to="/receiver/orders"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="My Orders"
                    >
                      <FaClipboardList size={14} />
                      <span className="hidden sm:inline">My Orders</span>
                    </Link>
                    <Link
                      to="/receiver/claims"
                      className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
                      title="My Claims"
                    >
                      <FaClipboardList size={14} />
                      <span className="hidden sm:inline">Claims</span>
                    </Link>
                  </>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
                >
                  <FaSignOutAlt />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;