const express = require('express');
const {
  getDonorStats,
  getDonorRecentClaims,
  getDonorAllClaims
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// UPDATED: Accept both 'donor' and 'seller' roles
router.get('/stats', authorize('donor', 'seller'), getDonorStats);
router.get('/claims/recent', authorize('donor', 'seller'), getDonorRecentClaims);
router.get('/claims', authorize('donor', 'seller'), getDonorAllClaims);

module.exports = router;