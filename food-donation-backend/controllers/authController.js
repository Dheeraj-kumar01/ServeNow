const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    
    const { name, email, password, role, phone, address, location } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!phone) missingFields.push('phone');
    if (!address) missingFields.push('address');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
    }

    // Map role for backward compatibility (keep original role for frontend)
    // Store in database as seller/buyer, but respond with donor/receiver for frontend
    let dbRole = role;
    let responseRole = role;
    
    if (role === 'donor') {
      dbRole = 'seller';
      responseRole = 'donor';
    } else if (role === 'receiver') {
      dbRole = 'buyer';
      responseRole = 'receiver';
    } else {
      dbRole = role;
      responseRole = role;
    }

    // Handle location
    let locationData = {
      type: 'Point',
      coordinates: [77.2090, 28.6139] // Default Delhi coordinates
    };

    if (location && location.lng && location.lat) {
      locationData.coordinates = [parseFloat(location.lng), parseFloat(location.lat)];
      console.log('Using provided location:', locationData.coordinates);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: dbRole,
      phone,
      address,
      location: locationData
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: responseRole, // Send original role to frontend
        phone: user.phone,
        address: user.address,
        token: token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error details:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      
      // Map role for frontend compatibility
      let frontendRole = user.role;
      if (user.role === 'seller') frontendRole = 'donor';
      if (user.role === 'buyer') frontendRole = 'receiver';
      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: frontendRole,
        phone: user.phone,
        address: user.address,
        token: token
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Map role for frontend compatibility
    let frontendRole = user.role;
    if (user.role === 'seller') frontendRole = 'donor';
    if (user.role === 'buyer') frontendRole = 'receiver';
    
    const userData = user.toObject();
    userData.role = frontendRole;
    
    res.json(userData);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify user (alias for getMe)
// @route   GET /api/auth/verify
// @access  Private
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Map role for frontend compatibility
    let frontendRole = user.role;
    if (user.role === 'seller') frontendRole = 'donor';
    if (user.role === 'buyer') frontendRole = 'receiver';
    
    const userData = user.toObject();
    userData.role = frontendRole;
    
    res.json(userData);
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    
    if (req.body.location) {
      let locationData = {
        type: 'Point',
        coordinates: [77.2090, 28.6139]
      };
      
      if (req.body.location.lng && req.body.location.lat) {
        locationData.coordinates = [parseFloat(req.body.location.lng), parseFloat(req.body.location.lat)];
      }
      
      user.location = locationData;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Map role for frontend compatibility
    let frontendRole = updatedUser.role;
    if (updatedUser.role === 'seller') frontendRole = 'donor';
    if (updatedUser.role === 'buyer') frontendRole = 'receiver';

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: frontendRole,
      phone: updatedUser.phone,
      address: updatedUser.address,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  verifyUser
};