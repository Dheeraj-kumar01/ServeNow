const FoodListing = require('../models/FoodListing');
const Request = require('../models/Request');
const User = require('../models/User');

// @desc    Get donor/seller statistics
// @route   GET /api/donor/stats
// @access  Private (Seller only)
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

    // Get all orders for this seller
    const orders = await Request.find({ donor: sellerId });
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const acceptedOrders = orders.filter(o => o.status === 'accepted').length;
    const rejectedOrders = orders.filter(o => o.status === 'rejected').length;
    
    // Calculate earnings
    const totalEarnings = orders.reduce((sum, order) => sum + (order.sellerEarning || 0), 0);
    const totalCommission = orders.reduce((sum, order) => sum + (order.commission || 0), 0);

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
      success: true,
      totalDonations: totalProducts,
      activeListings,
      completedDonations: completedOrders,
      totalBeneficiaries,
      totalQuantity: totalQuantity.toFixed(1),
      totalEarnings: totalEarnings.toFixed(2),
      totalCommission: totalCommission.toFixed(2),
      totalOrders,
      pendingOrders,
      acceptedOrders,
      rejectedOrders
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donor's recent claims/orders
// @route   GET /api/donor/claims/recent
// @access  Private (Seller only)
const getDonorRecentClaims = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const recentClaims = await Request.find({ donor: sellerId })
      .populate('food', 'name quantity unit image price')
      .populate('receiver', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    // Add amount to each claim if not present
    const claimsWithAmount = recentClaims.map(claim => {
      const claimObj = claim.toObject();
      if (!claimObj.amount && claimObj.food) {
        claimObj.amount = claimObj.food.price || 0;
      }
      return claimObj;
    });
    
    res.json(claimsWithAmount);
  } catch (error) {
    console.error('Get donor recent claims error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all claims for donor
// @route   GET /api/donor/claims
// @access  Private (Seller only)
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