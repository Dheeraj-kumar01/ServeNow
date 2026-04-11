const express = require('express');
const {
  getDonorRequests,
  getReceiverClaims,
  acceptRequest,
  rejectRequest,
  generateOTP,
  verifyOTP,
  resendOTP,
  completeRequest
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// DONOR ROUTES
// ============================================
router.get('/donor/requests', authorize('donor'), getDonorRequests);
router.put('/:id/accept', authorize('donor'), acceptRequest);
router.put('/:id/reject', authorize('donor'), rejectRequest);
router.post('/:id/generate-otp', authorize('donor'), generateOTP);
router.post('/:id/resend-otp', authorize('donor'), resendOTP);

// ============================================
// RECEIVER ROUTES
// ============================================
router.get('/receiver/claims', authorize('receiver'), getReceiverClaims);
router.post('/:id/verify', authorize('receiver'), verifyOTP);
router.put('/:id/complete', authorize('receiver'), completeRequest);

module.exports = router;