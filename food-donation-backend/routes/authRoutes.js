const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getMe, 
  updateProfile,
  verifyUser  // Import verifyUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/verify', protect, verifyUser);  // Use verifyUser instead of getMe

module.exports = router;