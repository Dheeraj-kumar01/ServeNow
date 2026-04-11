const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodListing',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [500, 'Message cannot be more than 500 characters'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
chatSchema.index({ food: 1, createdAt: -1 });
chatSchema.index({ sender: 1, receiver: 1 });
chatSchema.index({ receiver: 1, read: 1 });

module.exports = mongoose.model('Chat', chatSchema);