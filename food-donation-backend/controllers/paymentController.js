const Razorpay = require('razorpay');
const crypto = require('crypto');
const Request = require('../models/Request');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const { generateOTP } = require('../utils/generateOTP');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private (Buyer only)
const createRazorpayOrder = async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findById(requestId).populate('food');
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.paymentStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already completed' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const options = {
      amount: request.amount * 100,
      currency: 'INR',
      receipt: `receipt_${requestId}_${Date.now()}`,
      notes: {
        requestId: requestId.toString(),
        productId: request.food._id.toString(),
        buyerId: request.receiver.toString(),
        sellerId: request.donor.toString()
      }
    };

    const order = await razorpayInstance.orders.create(options);

    request.razorpayOrderId = order.id;
    await request.save();

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: request.amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private (Buyer only)
const verifyPayment = async (req, res) => {
  try {
    const {
      requestId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    request.paymentStatus = 'completed';
    request.razorpayPaymentId = razorpay_payment_id;
    request.razorpaySignature = razorpay_signature;
    request.status = 'accepted';
    await request.save();

    const food = await FoodListing.findById(request.food);
    food.orderStatus = 'accepted';
    food.paymentStatus = 'paid';
    await food.save();

    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 30);
    request.otp = otp;
    request.otpExpiry = otpExpiry;
    await request.save();

    await User.findByIdAndUpdate(request.donor, {
      $inc: {
        totalSales: 1,
        totalEarnings: request.sellerEarning,
        totalCommission: request.commission
      }
    });

    await User.findByIdAndUpdate(request.receiver, {
      $inc: { totalPurchases: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      otp: otp
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
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
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.status(200).json({
      success: true,
      paymentStatus: request.paymentStatus,
      amount: request.amount,
      razorpayOrderId: request.razorpayOrderId,
      razorpayPaymentId: request.razorpayPaymentId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus
};