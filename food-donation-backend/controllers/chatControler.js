const Chat = require('../models/Chat');
const FoodListing = require('../models/FoodListing');
const User = require('../models/User');

// @desc    Get messages for a food listing
// @route   GET /api/chat/:foodId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Validate foodId format
    if (!foodId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid food ID format' });
    }

    const food = await FoodListing.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // AUTHORIZATION LOGIC:
    // Allow access if:
    // 1. User is the donor (owns the food)
    // 2. User is the receiver who claimed the food
    // 3. User is a receiver AND food is available (for inquiries)
    const isDonor = food.donor.toString() === req.user._id.toString();
    const isClaimer = food.claimedBy && food.claimedBy.toString() === req.user._id.toString();
    const isReceiverAndAvailable = req.user.role === 'receiver' && food.status === 'available';
    
    // Also allow if user has sent any message to this food (has chat history)
    const hasChatHistory = await Chat.exists({
      food: foodId,
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    });

    if (!isDonor && !isClaimer && !isReceiverAndAvailable && !hasChatHistory) {
      console.log(`Unauthorized access to chat. User: ${req.user._id} (${req.user.role}), Food donor: ${food.donor}, Status: ${food.status}`);
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    console.log(`Authorized access to chat. User: ${req.user._id} (${req.user.role}), Food: ${food.name}, Status: ${food.status}`);

    const messages = await Chat.find({ food: foodId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name');

    const total = await Chat.countDocuments({ food: foodId });

    res.json({
      messages: messages.reverse(),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Send message
// @route   POST /api/chat
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { foodId, receiverId, message } = req.body;

    console.log('Send message request:', { foodId, receiverId, message, userId: req.user._id, role: req.user.role });

    if (!foodId || !receiverId || !message) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['foodId', 'receiverId', 'message'],
        received: { foodId, receiverId, message }
      });
    }

    // Validate foodId format
    if (!foodId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid food ID format' });
    }

    const food = await FoodListing.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    // Allow anyone to send messages (donor or receiver)
    // No restrictions - anyone can inquire about available food
    const chat = await Chat.create({
      food: foodId,
      sender: req.user._id,
      receiver: receiverId,
      message: message.trim(),
      read: false
    });

    await chat.populate('sender', 'name');

    console.log('Message sent successfully:', chat._id);

    res.status(201).json({
      _id: chat._id,
      food: chat.food,
      sender: chat.sender,
      receiver: chat.receiver,
      message: chat.message,
      read: chat.read,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:foodId/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { foodId } = req.params;

    // Validate foodId format
    if (!foodId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid food ID format' });
    }

    await Chat.updateMany(
      { food: foodId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all chats for user
// @route   GET /api/chat/list
// @access  Private
const getUserChats = async (req, res) => {
  try {
    // Get all chats where user is either sender or receiver
    const chats = await Chat.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .populate('food', 'name status donor claimedBy');

    // Group by food to get unique conversations
    const chatMap = new Map();
    
    for (const chat of chats) {
      const foodId = chat.food._id.toString();
      
      if (!chatMap.has(foodId)) {
        // Get the other user
        const otherUser = chat.sender._id.toString() === req.user._id.toString() 
          ? chat.receiver 
          : chat.sender;
        
        chatMap.set(foodId, {
          _id: foodId,
          food: {
            _id: chat.food._id,
            name: chat.food.name,
            status: chat.food.status
          },
          otherUser: {
            _id: otherUser._id,
            name: otherUser.name
          },
          lastMessage: chat.message,
          lastMessageTime: chat.createdAt,
          unreadCount: 0
        });
      }
      
      // Count unread messages
      if (chat.receiver._id.toString() === req.user._id.toString() && !chat.read) {
        const current = chatMap.get(foodId);
        current.unreadCount += 1;
        chatMap.set(foodId, current);
      }
    }
    
    // Convert map to array and sort by last message time
    const result = Array.from(chatMap.values())
      .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    
    res.json(result);
  } catch (error) {
    console.error('Get user chats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMessages,
  sendMessage,
  markAsRead,
  getUserChats
};