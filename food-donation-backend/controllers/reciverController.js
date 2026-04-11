const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');

// @desc    Get receiver statistics
// @route   GET /api/receiver/stats
// @access  Private (Receiver only)
const getReceiverStats = async (req, res) => {
  try {
    const receiverId = req.user._id;

    // Get total claims
    const totalClaims = await Request.countDocuments({ receiver: receiverId });

    // Get completed claims (successful pickups)
    const completedClaims = await Request.countDocuments({
      receiver: receiverId,
      status: 'completed'
    });

    // Get pending claims
    const pendingClaims = await Request.countDocuments({
      receiver: receiverId,
      status: 'pending'
    });

    // Get total food quantity received
    const completedRequests = await Request.find({
      receiver: receiverId,
      status: 'completed'
    }).populate('food', 'quantity unit');

    const totalQuantity = completedRequests.reduce((sum, req) => {
      return sum + (req.food?.quantity || 0);
    }, 0);

    res.json({
      totalClaims,
      completedClaims,
      pendingClaims,
      totalQuantity: totalQuantity.toFixed(1)
    });
  } catch (error) {
    console.error('Get receiver stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get receiver's recent claims
// @route   GET /api/receiver/claims/recent
// @access  Private (Receiver only)
const getReceiverRecentClaims = async (req, res) => {
  try {
    const receiverId = req.user._id;

    const recentClaims = await Request.find({ receiver: receiverId })
      .populate('food', 'name quantity unit image pickupAddress donor')
      .populate('donor', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recentClaims);
  } catch (error) {
    console.error('Get receiver recent claims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getReceiverStats,
  getReceiverRecentClaims
};