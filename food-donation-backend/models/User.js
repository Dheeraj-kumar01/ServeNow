const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  // UPDATED: Accept both old and new role values
  role: {
    type: String,
    enum: ['seller', 'buyer', 'donor', 'receiver', 'admin'],
    default: 'buyer'
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [77.2090, 28.6139]
    }
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  // Marketplace fields
  totalSales: {
    type: Number,
    default: 0
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  // Legacy fields (keep for compatibility)
  totalDonations: {
    type: Number,
    default: 0
  },
  totalClaims: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create 2dsphere index for location queries
userSchema.index({ location: '2dsphere' });

// FIXED: Hash password before saving - NO "next" ISSUE
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Helper method to check if user is seller
userSchema.methods.isSeller = function() {
  return this.role === 'seller' || this.role === 'donor';
};

// Helper method to check if user is buyer
userSchema.methods.isBuyer = function() {
  return this.role === 'buyer' || this.role === 'receiver';
};

module.exports = mongoose.model('User', userSchema);