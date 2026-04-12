const express = require('express');
const {
  createFoodListing,
  getNearbyFood,
  getMyListings,
  getFoodById,
  updateFoodListing,
  deleteFoodListing,
  claimFood,
  getSellerStats
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/nearby', getNearbyFood);

// Protected routes
router.use(protect);

// UPDATED: Accept both 'donor' and 'seller' roles
router.post('/', authorize('donor', 'seller'), upload.single('image'), createFoodListing);
router.get('/mine', authorize('donor', 'seller'), getMyListings);
router.get('/seller/stats', authorize('donor', 'seller'), getSellerStats);
router.post('/:id/claim', authorize('receiver', 'buyer'), claimFood);

router.get('/:id', getFoodById);
router.put('/:id', authorize('donor', 'seller'), updateFoodListing);
router.delete('/:id', authorize('donor', 'seller'), deleteFoodListing);

module.exports = router;