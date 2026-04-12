const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { generateOTP, isOTPExpired } = require('../utils/generateOTP');

// @desc    Get all requests for seller's food
// @route   GET /api/requests/donor/requests
// @access  Private (Seller only)
const getDonorRequests = async (req, res) => {
  try {
    const requests = await Request.find({ donor: req.user._id })
      .populate('food', 'name quantity unit image pickupAddress price commission sellerEarning')
      .populate('receiver', 'name phone address')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get seller requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders for buyer
// @route   GET /api/requests/receiver/claims
// @access  Private (Buyer only)
const getReceiverClaims = async (req, res) => {
  try {
    const claims = await Request.find({ receiver: req.user._id })
      .populate('food', 'name quantity unit image pickupAddress price')
      .populate('donor', 'name phone address')
      .sort({ createdAt: -1 });
    
    res.json(claims);
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept order (Seller)
// @route   PUT /api/requests/:id/accept
// @access  Private (Seller only)
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('food', 'name quantity unit')
      .populate('receiver', 'name phone');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    console.log('Order status:', request.status);
    console.log('Payment status:', request.paymentStatus);

    // Allow acceptance even if payment is pending for testing
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Generate OTP for delivery
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);

    request.otp = otp;
    request.otpExpiry = otpExpiry;
    request.status = 'accepted';
    await request.save();

    // Update food status
    await FoodListing.findByIdAndUpdate(request.food._id, {
      orderStatus: 'accepted'
    });

    console.log('Order accepted, OTP generated:', otp);

    res.json({
      success: true,
      message: 'Order accepted',
      otp: otp,
      request
    });
  } catch (error) {
    console.error('Accept order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject order (Seller)
// @route   PUT /api/requests/:id/reject
// @access  Private (Seller only)
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    request.status = 'rejected';
    await request.save();

    // Update food status back to available
    await FoodListing.findByIdAndUpdate(request.food, {
      orderStatus: 'available',
      orderedBy: null
    });

    res.json({
      success: true,
      message: 'Order rejected',
      request
    });
  } catch (error) {
    console.error('Reject order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify OTP and complete delivery (Buyer)
// @route   POST /api/requests/:id/verify
// @access  Private (Buyer only)
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const request = await Request.findById(req.params.id)
      .populate('food', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Order not ready for delivery' });
    }

    if (request.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (isOTPExpired(request.otpExpiry)) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    request.otp = undefined;
    request.otpExpiry = undefined;
    await request.save();

    // Update food status
    await FoodListing.findByIdAndUpdate(request.food, {
      orderStatus: 'delivered'
    });

    // Update buyer stats
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { totalPurchases: 1 }
    });

    res.json({
      success: true,
      message: 'Order delivered successfully!',
      request
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get seller orders with stats
// @route   GET /api/requests/seller/orders
// @access  Private (Seller only)
const getSellerOrders = async (req, res) => {
  try {
    const orders = await Request.find({ donor: req.user._id })
      .populate('food', 'name quantity unit image price')
      .populate('receiver', 'name phone')
      .sort({ createdAt: -1 });
    
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.sellerEarning || 0), 0),
      totalCommission: orders.reduce((sum, o) => sum + (o.commission || 0), 0),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      acceptedOrders: orders.filter(o => o.status === 'accepted').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      rejectedOrders: orders.filter(o => o.status === 'rejected').length
    };
    
    res.json({ orders, stats });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDonorRequests,
  getReceiverClaims,
  acceptRequest,
  rejectRequest,
  verifyOTP,
  getSellerOrders
};