const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Get donor statistics
// @route   GET /api/donor/stats
// @access  Private (Donor/Seller only)
const getDonorStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get total products count
    const totalProducts = await FoodListing.countDocuments({ seller: sellerId });

    // Get active listings (available and not expired)
    const activeListings = await FoodListing.countDocuments({
      seller: sellerId,
      orderStatus: 'available',
      expiryDate: { $gte: new Date() }
    });

    // Get completed orders (delivered)
    const completedOrders = await Request.countDocuments({
      donor: sellerId,
      status: 'completed'
    });

    // Get total beneficiaries (unique buyers)
    const beneficiaries = await Request.distinct('receiver', {
      donor: sellerId,
      status: 'completed'
    });
    const totalBeneficiaries = beneficiaries.length;

    // Get total food quantity sold
    const products = await FoodListing.find({ seller: sellerId });
    const totalQuantity = products.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      totalDonations: totalProducts,
      activeListings,
      completedDonations: completedOrders,
      totalBeneficiaries,
      totalQuantity: totalQuantity.toFixed(1)
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donor's recent claims/orders
// @route   GET /api/donor/claims/recent
// @access  Private (Donor/Seller only)
const getDonorRecentClaims = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const recentClaims = await Request.find({ donor: sellerId })
      .populate('food', 'name quantity unit image price')
      .populate('receiver', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recentClaims);
  } catch (error) {
    console.error('Get donor recent claims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all claims for donor
// @route   GET /api/donor/claims
// @access  Private (Donor/Seller only)
const getDonorAllClaims = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { donor: sellerId };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const claims = await Request.find(query)
      .populate('food', 'name quantity unit image pickupAddress price')
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