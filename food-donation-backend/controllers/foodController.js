const FoodListing = require('../models/FoodListing');
const User = require('../models/User');
const Request = require('../models/Request');

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to check if food is expired
function isFoodExpired(expiryDate, expiryTime) {
  const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
  return expiryDateTime < new Date();
}

// @desc    Create food listing (SELLER)
// @route   POST /api/food
// @access  Private (Seller only)
const createFoodListing = async (req, res) => {
  try {
    console.log('Creating food listing...');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
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
      isUrgent,
      price
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!category) missingFields.push('category');
    if (!dietaryType) missingFields.push('dietaryType');
    if (!quantity) missingFields.push('quantity');
    if (!expiryDate) missingFields.push('expiryDate');
    if (!expiryTime) missingFields.push('expiryTime');
    if (!pickupAddress) missingFields.push('pickupAddress');
    if (!location) missingFields.push('location');
    if (!price) missingFields.push('price');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        required: ['name', 'category', 'dietaryType', 'quantity', 'expiryDate', 'expiryTime', 'pickupAddress', 'location', 'price']
      });
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 1) {
      return res.status(400).json({ message: 'Price must be a valid number greater than 0' });
    }

    // Calculate commission (20%) and seller earning (80%)
    const commission = parsedPrice * 0.20;
    const sellerEarning = parsedPrice * 0.80;

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

    // Create food listing
    const food = await FoodListing.create({
      seller: req.user._id,
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
      orderStatus: 'available',
      paymentStatus: 'pending',
      image: req.file ? `/uploads/${req.file.filename}` : null,
      price: parsedPrice,
      commission: commission,
      sellerEarning: sellerEarning
    });

    // Update seller stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalSales: 1 }
    });

    console.log('Product created successfully:', food._id);
    console.log(`Price: ₹${parsedPrice}, Commission: ₹${commission}, You earn: ₹${sellerEarning}`);
    
    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      food: {
        _id: food._id,
        name: food.name,
        price: food.price,
        commission: food.commission,
        sellerEarning: food.sellerEarning,
        orderStatus: food.orderStatus
      }
    });
    
  } catch (error) {
    console.error('Create food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby food listings (BUYER view)
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
      orderStatus: 'available',
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
    .populate('seller', 'name phone rating')
    .sort({ isUrgent: -1, createdAt: -1 })
    .limit(50);

    // Filter out expired foods by time and calculate distance
    const availableFoods = foods.filter(food => {
      return !isFoodExpired(food.expiryDate, food.expiryTime);
    });

    const foodsWithDistance = availableFoods.map(food => {
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

// @desc    Get seller's food listings
// @route   GET /api/food/mine
// @access  Private (Seller only)
const getMyListings = async (req, res) => {
  try {
    const foods = await FoodListing.find({ seller: req.user._id })
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 });
    
    // Get orders for each food
    const foodsWithOrders = await Promise.all(foods.map(async (food) => {
      const orders = await Request.find({ food: food._id })
        .populate('receiver', 'name phone')
        .sort({ createdAt: -1 });
      return {
        ...food.toObject(),
        claims: orders
      };
    }));
    
    // Calculate seller earnings summary
    const totalEarnings = foods.reduce((sum, food) => sum + (food.sellerEarning || 0), 0);
    const totalCommission = foods.reduce((sum, food) => sum + (food.commission || 0), 0);
    
    res.json({
      products: foodsWithOrders,
      stats: {
        totalProducts: foods.length,
        totalEarnings,
        totalCommission
      }
    });
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
      .populate('seller', 'name phone rating address location');
    
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Check if food is expired
    if (isFoodExpired(food.expiryDate, food.expiryTime)) {
      food.orderStatus = 'expired';
      await food.save();
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
// @access  Private (Seller only)
const updateFoodListing = async (req, res) => {
  try {
    let food = await FoodListing.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If price is updated, recalculate commission
    if (req.body.price && req.body.price !== food.price) {
      req.body.commission = req.body.price * 0.20;
      req.body.sellerEarning = req.body.price * 0.80;
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
// @access  Private (Seller only)
const deleteFoodListing = async (req, res) => {
  try {
    const food = await FoodListing.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    if (food.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await food.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete food error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create order (BUYER places order - formerly claimFood)
// @route   POST /api/food/:id/claim
// @access  Private (Buyer only)
const claimFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    const buyerId = req.user._id;

    console.log(`Creating order for product: ${foodId} by user: ${buyerId}`);

    // Find the food listing
    const food = await FoodListing.findById(foodId);
    
    if (!food) {
      console.log('Product not found:', foodId);
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Product found:', food.name, 'Status:', food.orderStatus);

    // Check if product is available
    if (food.orderStatus !== 'available') {
      return res.status(400).json({ message: 'Product is no longer available' });
    }

    // Check if product is expired
    if (isFoodExpired(food.expiryDate, food.expiryTime)) {
      return res.status(400).json({ message: 'Product has expired' });
    }

    // Check if user is trying to buy their own product
    if (food.seller.toString() === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot buy your own product' });
    }

    // Check if already ordered by this user
    const existingOrder = await Request.findOne({
      food: foodId,
      receiver: buyerId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingOrder) {
      return res.status(400).json({ message: 'You have already requested this product' });
    }

    // Create order request
    const request = await Request.create({
      food: foodId,
      donor: food.seller,
      receiver: buyerId,
      amount: food.price,
      commission: food.commission,
      sellerEarning: food.sellerEarning,
      paymentStatus: 'pending',
      status: 'pending'
    });

    console.log('Order created:', request._id);

    // Update product status
    food.orderStatus = 'requested';
    food.orderedBy = buyerId;
    await food.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully! Please complete payment.',
      order: {
        _id: request._id,
        status: request.status,
        amount: request.amount,
        paymentStatus: request.paymentStatus,
        createdAt: request.createdAt
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get seller dashboard stats
// @route   GET /api/food/seller/stats
// @access  Private (Seller only)
const getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const products = await FoodListing.find({ seller: sellerId });
    const orders = await Request.find({ donor: sellerId });
    
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.sellerEarning || 0), 0);
    const totalCommission = orders.reduce((sum, order) => sum + (order.commission || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const acceptedOrders = orders.filter(o => o.status === 'accepted').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const rejectedOrders = orders.filter(o => o.status === 'rejected').length;
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCommission,
      pendingOrders,
      acceptedOrders,
      completedOrders,
      rejectedOrders
    });
  } catch (error) {
    console.error('Get seller stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createFoodListing,
  getNearbyFood,
  getMyListings,
  getFoodById,
  updateFoodListing,
  deleteFoodListing,
  claimFood,
  getSellerStats
};