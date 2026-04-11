const express = require('express');
const {
  getMessages,
  sendMessage,
  markAsRead,
  getUserChats
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes
// Otherwise "list" will be treated as a foodId parameter

// Get all chats for current user - THIS MUST COME FIRST
router.get('/list', getUserChats);

// Get messages for a specific food item
router.get('/:foodId', getMessages);

// Send a new message
router.post('/', sendMessage);

// Mark messages as read for a food item
router.put('/:foodId/read', markAsRead);

module.exports = router;