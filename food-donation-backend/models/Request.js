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
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  otp: {
    type: String,
    default: null  // Make sure OTP can be stored
  },
  otpExpiry: {
    type: Date,
    default: null  // Make sure expiry can be stored
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
requestSchema.index({ food: 1, receiver: 1 }, { unique: true });
requestSchema.index({ donor: 1, status: 1 });
requestSchema.index({ receiver: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);