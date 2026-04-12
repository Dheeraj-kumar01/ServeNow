const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const razorpayInstance = require('../utils/razorpay');
const crypto = require('crypto');
const { generateOTP } = require('../utils/generateOTP');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (Buyer only)
const createRazorpayOrder = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findById(requestId).populate('food');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: request.amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `order_${requestId}_${Date.now()}`,
      notes: {
        requestId: requestId.toString(),
        productId: request.food._id.toString(),
        buyerId: request.receiver.toString()
      }
    });

    request.razorpayOrderId = razorpayOrder.id;
    await request.save();

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: request.amount,
      razorpayKey: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Buyer only)
const verifyPayment = async (req, res) => {
  try {
    const {
      requestId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpaySignature;

    if (!isAuthentic) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update request
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.paymentStatus = 'completed';
    request.razorpayPaymentId = razorpayPaymentId;
    request.razorpaySignature = razorpaySignature;
    request.status = 'accepted'; // Auto-accept after payment
    await request.save();

    // Update food listing status
    const food = await FoodListing.findById(request.food);
    food.orderStatus = 'accepted';
    food.paymentStatus = 'paid';
    await food.save();

    // Generate OTP for delivery
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);
    request.otp = otp;
    request.otpExpiry = otpExpiry;
    await request.save();

    // Update seller earnings
    await User.findByIdAndUpdate(request.donor, {
      $inc: {
        totalSales: 1,
        totalEarnings: request.sellerEarning,
        totalCommission: request.commission
      }
    });

    // Update buyer stats
    await User.findByIdAndUpdate(request.receiver, {
      $inc: { totalPurchases: 1 }
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      otp: otp
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:requestId
// @access  Private
const getPaymentStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await Request.findById(requestId).select('paymentStatus amount razorpayOrderId razorpayPaymentId');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({
      paymentStatus: request.paymentStatus,
      amount: request.amount,
      razorpayOrderId: request.razorpayOrderId,
      razorpayPaymentId: request.razorpayPaymentId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus
};