const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Get donor statistics
// @route   GET /api/donor/stats
// @access  Private (Donor only)
const getDonorStats = async (req, res) => {
  try {
    const donorId = req.user._id;

    // Get total donations count
    const totalDonations = await FoodListing.countDocuments({ donor: donorId });

    // Get active listings (available and not expired)
    const activeListings = await FoodListing.countDocuments({
      donor: donorId,
      status: 'available',
      expiryDate: { $gte: new Date() }
    });

    // Get completed donations (food that was claimed and completed)
    const completedDonations = await FoodListing.countDocuments({
      donor: donorId,
      status: 'completed'
    });

    // Get total beneficiaries (unique receivers who claimed donor's food)
    const beneficiaries = await Request.distinct('receiver', {
      donor: donorId,
      status: 'completed'
    });
    const totalBeneficiaries = beneficiaries.length;

    // Get total food quantity donated (sum of all quantities)
    const foodItems = await FoodListing.find({ donor: donorId });
    const totalQuantity = foodItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      totalDonations,
      activeListings,
      completedDonations,
      totalBeneficiaries,
      totalQuantity: totalQuantity.toFixed(1)
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donor's recent claims
// @route   GET /api/donor/claims/recent
// @access  Private (Donor only)
const getDonorRecentClaims = async (req, res) => {
  try {
    const donorId = req.user._id;

    // Get recent claims for donor's food
    const recentClaims = await Request.find({ donor: donorId })
      .populate('food', 'name quantity unit image')
      .populate('receiver', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format claims for display
    const formattedClaims = recentClaims.map(claim => ({
      _id: claim._id,
      food: claim.food,
      receiver: claim.receiver,
      status: claim.status,
      message: claim.message,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt
    }));

    res.json(formattedClaims);
  } catch (error) {
    console.error('Get donor recent claims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all claims for donor
// @route   GET /api/donor/claims
// @access  Private (Donor only)
const getDonorAllClaims = async (req, res) => {
  try {
    const donorId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { donor: donorId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const claims = await Request.find(query)
      .populate('food', 'name quantity unit image pickupAddress')
      .populate('receiver', 'name phone address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.json({
      claims,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get donor all claims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDonorStats,
  getDonorRecentClaims,
  getDonorAllClaims
};