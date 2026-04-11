const express = require('express');
const {
  getDonorStats,
  getDonorRecentClaims,
  getDonorAllClaims
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication and donor role
router.use(protect);
router.use(authorize('donor'));

router.get('/stats', getDonorStats);
router.get('/claims/recent', getDonorRecentClaims);
router.get('/claims', getDonorAllClaims);

module.exports = router;