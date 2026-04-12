const express = require('express');
const {
  getDonorRequests,
  getReceiverClaims,
  acceptRequest,
  rejectRequest,
  verifyOTP,
  getSellerOrders
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// UPDATED: Accept both 'donor' and 'seller' roles for seller routes
router.get('/donor/requests', authorize('donor', 'seller'), getDonorRequests);
router.get('/seller/orders', authorize('donor', 'seller'), getSellerOrders);
router.put('/:id/accept', authorize('donor', 'seller'), acceptRequest);
router.put('/:id/reject', authorize('donor', 'seller'), rejectRequest);

// UPDATED: Accept both 'receiver' and 'buyer' roles for buyer routes
router.get('/receiver/claims', authorize('receiver', 'buyer'), getReceiverClaims);
router.post('/:id/verify', authorize('receiver', 'buyer'), verifyOTP);

module.exports = router;