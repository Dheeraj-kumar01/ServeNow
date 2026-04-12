const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  getPaymentStatus
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Buyer only routes
router.post('/create-order', authorize('receiver', 'buyer'), createRazorpayOrder);
router.post('/verify', authorize('receiver', 'buyer'), verifyPayment);
router.get('/status/:requestId', getPaymentStatus);

module.exports = router;