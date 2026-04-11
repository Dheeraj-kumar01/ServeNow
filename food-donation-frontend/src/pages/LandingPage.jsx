import React from 'react';
import { Link } from 'react-router-dom';
import { FaUtensils, FaHandHoldingHeart, FaLeaf, FaUsers, FaChartLine, FaShieldAlt } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Food Waste,
              <span className="text-green-600"> Feed Communities</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect restaurants, cafes, and individuals with NGOs and orphanages to reduce food waste and fight hunger.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/about" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1.3B+</div>
              <div className="text-gray-600">Tons of food wasted annually</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">820M+</div>
              <div className="text-gray-600">People suffer from hunger</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">8%</div>
              <div className="text-gray-600">Global greenhouse gases from food waste</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How FoodShare Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaUtensils className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Donors List Food</h3>
              <p className="text-gray-600">Restaurants and individuals share excess food with details and photos</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaHandHoldingHeart className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Receivers Claim</h3>
              <p className="text-gray-600">NGOs and shelters find and claim nearby available food</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FaLeaf className="text-3xl text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Impact Created</h3>
              <p className="text-gray-600">Track food saved, meals provided, and CO2 emissions reduced</p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ServeNow?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <FaUsers className="text-3xl text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
                <p className="text-gray-600">Join a community of compassionate individuals and organizations making a difference</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaChartLine className="text-3xl text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Track Your Impact</h3>
                <p className="text-gray-600">See exactly how much food you've saved and how many people you've helped</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaShieldAlt className="text-3xl text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Verified users, OTP verification, and rating system ensure safe transactions</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaLeaf className="text-3xl text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
                <p className="text-gray-600">Reduce food waste and your carbon footprint with every donation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join thousands of donors and receivers already using ServeNow
          </p>
          <Link to="/signup" className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all">
            Start Your Journey
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;