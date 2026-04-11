const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user?.name || socket.id}`);

    // Join a specific chat room
    socket.on('join-chat', (data) => {
      const { foodId } = data;
      socket.join(`chat_${foodId}`);
      console.log(`User ${socket.user?.name} joined chat room: chat_${foodId}`);
    });

    // Send a message
    socket.on('send-message', (data) => {
      const { foodId, message, receiverId } = data;
      io.to(`chat_${foodId}`).emit('new-message', {
        ...data,
        senderId: socket.user._id,
        senderName: socket.user.name,
        timestamp: new Date()
      });
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { foodId, userId, receiverId } = data;
      socket.to(`chat_${foodId}`).emit('user-typing', {
        userId,
        foodId,
        isTyping: true
      });
    });

    // Leave chat room
    socket.on('leave-chat', (data) => {
      const { foodId } = data;
      socket.leave(`chat_${foodId}`);
      console.log(`User left chat room: chat_${foodId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user?.name || socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };