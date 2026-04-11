import api from './api';

// Get messages for a specific food item
export const getMessages = async (foodId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/chat/${foodId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get messages error:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/chat', messageData);
    return response.data;
  } catch (error) {
    console.error('Send message error:', error);
    throw error;
  }
};

// Mark messages as read for a specific food item
export const markAsRead = async (foodId) => {
  try {
    const response = await api.put(`/chat/${foodId}/read`);
    return response.data;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

// Get all chats for the current user (donor or receiver)
export const getUserChats = async () => {
  try {
    const response = await api.get('/chat/list');
    return response.data;
  } catch (error) {
    console.error('Get user chats error:', error);
    throw error;
  }
};

// Delete a chat (optional)
export const deleteChat = async (chatId) => {
  try {
    const response = await api.delete(`/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Delete chat error:', error);
    throw error;
  }
};

export default {
  getMessages,
  sendMessage,
  markAsRead,
  getUserChats,
  deleteChat
};