const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const Request = require('../models/Request');

// @desc    Create food listing
// @route   POST /api/food
// @access  Private (Donor only)
const createFoodListing = async (req, res) => {
  try {
    console.log('Creating food listing...');
    
    const {
      name,
      category,
      dietaryType,
      quantity,
      unit,
      description,
      expiryDate,
      expiryTime,
      pickupAddress,
      location,
      isUrgent
    } = req.body;

    // Validate required fields
    if (!name || !category || !dietaryType || !quantity || !expiryDate || !expiryTime || !pickupAddress || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'category', 'dietaryType', 'quantity', 'expiryDate', 'expiryTime', 'pickupAddress', 'location']
      });
    }

    // Parse location
    let locationData;
    if (typeof location === 'string') {
      try {
        locationData = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid location format' });
      }
    } else {
      locationData = location;
    }

    let lat, lng;
    if (locationData.lat && locationData.lng) {
      lat = parseFloat(locationData.lat);
      lng = parseFloat(locationData.lng);
    } else {
      return res.status(400).json({ message: 'Invalid location coordinates' });
    }

    const food = await FoodListing.create({
      donor: req.user._id,
      name: name.trim(),
      category,
      dietaryType,
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      description: description || '',
      expiryDate: new Date(expiryDate),
      expiryTime,
      pickupAddress: pickupAddress.trim(),
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      isUrgent: isUrgent === 'true' || isUrgent === true || false,
      status: 'available',
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDonations: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Food listed successfully',
      food
    });
    
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby food listings
// @route   GET /api/food/nearby
// @access  Public
const getNearbyFood = async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    const foods = await FoodListing.find({
      status: 'available',
      expiryDate: { $gte: new Date() },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000
        }
      }
    })
    .populate('donor', 'name phone rating')
    .sort({ isUrgent: -1, createdAt: -1 })
    .limit(50);

    const foodsWithDistance = foods.map(food => {
      const foodLocation = food.location.coordinates;
      const distance = calculateDistance(
        latitude, longitude,
        foodLocation[1], foodLocation[0]
      );
      return {
        ...food.toObject(),
        distance
      };
    });

    res.json(foodsWithDistance);
  } catch (error) {
    console.error('Get nearby food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donor's food listings
// @route   GET /api/food/mine
// @access  Private (Donor only)
const getMyListings = async (req, res) => {
  try {
    const foods = await FoodListing.find({ donor: req.user._id })
      .populate('donor', 'name phone')
      .sort({ createdAt: -1 });
    
    // Get claims for each food
    const foodsWithClaims = await Promise.all(foods.map(async (food) => {
      const claims = await Request.find({ food: food._id })
        .populate('receiver', 'name phone')
        .sort({ createdAt: -1 });
      return {
        ...food.toObject(),
        claims
      };
    }));
    
    res.json(foodsWithClaims);
  } catch (error) {
    console.error('Get my listings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get food by ID
// @route   GET /api/food/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id)
      .populate('donor', 'name phone rating address location');
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    food.views += 1;
    await food.save();

    res.json(food);
  } catch (error) {
    console.error('Get food by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update food listing
// @route   PUT /api/food/:id
// @access  Private (Donor only)
const updateFoodListing = async (req, res) => {
  try {
    let food = await FoodListing.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.donor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    food = await FoodListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(food);
  } catch (error) {
    console.error('Update food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete food listing
// @route   DELETE /api/food/:id
// @access  Private (Donor only)
const deleteFoodListing = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.donor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await food.deleteOne();
    res.json({ message: 'Food removed' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Claim food
// @route   POST /api/food/:id/claim
// @access  Private (Receiver only)
const claimFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    const receiverId = req.user._id;

    console.log(`Claiming food: ${foodId} by user: ${receiverId}`);

    // Find the food listing
    const food = await FoodListing.findById(foodId);
    
    if (!food) {
      console.log('Food not found:', foodId);
      return res.status(404).json({ message: 'Food not found' });
    }

    console.log('Food found:', food.name, 'Status:', food.status);

    // Check if food is available
    if (food.status !== 'available') {
      return res.status(400).json({ message: 'Food is no longer available' });
    }

    // Check if food is expired
    const expiryDateTime = new Date(`${food.expiryDate}T${food.expiryTime}`);
    if (expiryDateTime < new Date()) {
      return res.status(400).json({ message: 'Food has expired' });
    }

    // Check if user is trying to claim their own food
    if (food.donor.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own food' });
    }

    // Check if already claimed by this user
    const existingClaim = await Request.findOne({
      food: foodId,
      receiver: receiverId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already claimed this food' });
    }

    // Create claim request
    const request = await Request.create({
      food: foodId,
      donor: food.donor,
      receiver: receiverId,
      status: 'pending'
    });

    console.log('Claim request created:', request._id);

    // Update food status
    food.status = 'pending';
    food.claimedBy = receiverId;
    await food.save();

    res.status(201).json({
      success: true,
      message: 'Food claimed successfully! Waiting for donor approval.',
      claim: {
        _id: request._id,
        status: request.status,
        createdAt: request.createdAt
      }
    });

  } catch (error) {
    console.error('Claim food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = {
  createFoodListing,
  getNearbyFood,
  getMyListings,
  getFoodById,
  updateFoodListing,
  deleteFoodListing,
  claimFood
};