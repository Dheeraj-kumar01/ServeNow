const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // NEW FIELDS: Payment details
  amount: {
    type: Number,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  sellerEarning: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  // NEW FIELDS: Razorpay integration
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  // Existing fields
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  message: {
    type: String,
    maxlength: [200, 'Message cannot be more than 200 characters']
  },
  completedAt: {
    type: Date
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [200, 'Review cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Create indexes
requestSchema.index({ food: 1, receiver: 1 });
requestSchema.index({ donor: 1, status: 1 });
requestSchema.index({ receiver: 1, status: 1 });
requestSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Request', requestSchema);