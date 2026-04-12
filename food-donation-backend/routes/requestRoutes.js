const express = require('express');
const {
  getDonorRequests,
  getReceiverClaims,
  acceptRequest,
  rejectRequest,
  generateOTP,
  verifyOTP,
  resendOTP,
  completeRequest,
  getSellerOrders
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// DONOR/SELLER ROUTES
// ============================================
router.get('/donor/requests', authorize('donor', 'seller'), getDonorRequests);
router.get('/seller/orders', authorize('donor', 'seller'), getSellerOrders);
router.put('/:id/accept', authorize('donor', 'seller'), acceptRequest);
router.put('/:id/reject', authorize('donor', 'seller'), rejectRequest);
router.post('/:id/generate-otp', authorize('donor', 'seller'), generateOTP);  // <-- ADD THIS
router.post('/:id/resend-otp', authorize('donor', 'seller'), resendOTP);

// ============================================
// RECEIVER/BUYER ROUTES
// ============================================
router.get('/receiver/claims', authorize('receiver', 'buyer'), getReceiverClaims);
router.post('/:id/verify', authorize('receiver', 'buyer'), verifyOTP);
router.put('/:id/complete', authorize('receiver', 'buyer'), completeRequest);

module.exports = router;