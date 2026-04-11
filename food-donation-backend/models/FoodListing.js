const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add food name'],
    trim: true,
    maxlength: [100, 'Food name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Fast Food', 'Bakery', 'Snacks', 'Meals', 'Desserts', 'Beverages', 'Fruits', 'Vegetables', 'Groceries', 'Other']
  },
  dietaryType: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan'],
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity'],
    min: [0.1, 'Quantity must be at least 0.1']
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'plate', 'box', 'packet', 'bottle', 'piece', 'serving'],
    default: 'kg'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    default: 'default-food.jpg'
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add expiry date']
  },
  expiryTime: {
    type: String,
    required: [true, 'Please add expiry time']
  },
  pickupAddress: {
    type: String,
    required: [true, 'Please add pickup address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'pending', 'completed', 'expired', 'cancelled'],
    default: 'available'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for location-based queries
foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, expiryDate: 1 });
foodListingSchema.index({ donor: 1, createdAt: -1 });

// REMOVED: The problematic pre-save hook
// Expiry will be handled in the controller

module.exports = mongoose.model('FoodListing', foodListingSchema);