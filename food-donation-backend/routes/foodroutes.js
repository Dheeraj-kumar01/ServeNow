const express = require('express');
const {
  createFoodListing,
  getNearbyFood,
  getMyListings,
  getFoodById,
  updateFoodListing,
  deleteFoodListing,
  claimFood  // <-- ADD THIS
} = require('../controllers/foodController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/nearby', getNearbyFood);

// Protected routes
router.use(protect);

// Donor routes
router.post('/', authorize('donor'), upload.single('image'), createFoodListing);
router.get('/mine', authorize('donor'), getMyListings);

// Claim route - ADD THIS LINE
router.post('/:id/claim', authorize('receiver'), claimFood);

// Food CRUD routes
router.get('/:id', getFoodById);
router.put('/:id', authorize('donor'), updateFoodListing);
router.delete('/:id', authorize('donor'), deleteFoodListing);

module.exports = router;