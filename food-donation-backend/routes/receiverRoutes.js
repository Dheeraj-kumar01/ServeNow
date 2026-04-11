const express = require('express');
const {
  getReceiverStats,
  getReceiverRecentClaims
} = require('../controllers/receiverController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication and receiver role
router.use(protect);
router.use(authorize('receiver'));

router.get('/stats', getReceiverStats);
router.get('/claims/recent', getReceiverRecentClaims);

module.exports = router;