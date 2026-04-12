const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
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
  price: {
    type: Number,
    required: [true, 'Please add price'],
    min: [1, 'Price must be at least ₹1']
  },
  commission: {
    type: Number,
    default: 0
  },
  sellerEarning: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  image: {
    type: String,
    default: 'default-product.jpg'
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
  orderStatus: {
    type: String,
    enum: ['available', 'requested', 'accepted', 'delivered', 'cancelled', 'expired'],
    default: 'available'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  orderedBy: {
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

// REMOVED: problematic pre-save hook
// Commission is now calculated in the controller

// Create indexes
foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ orderStatus: 1, expiryDate: 1 });
foodListingSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);