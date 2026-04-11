import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendMessage, getMessages, markAsRead } from '../../services/chat';
import { FaTimes, FaPaperPlane, FaUser, FaClock, FaCheck, FaCheckDouble, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const ChatBox = ({ donorId, foodId, donorName, foodName, onClose }) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get backend URL
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) {
      console.log('No user or token, cannot connect to chat');
      return;
    }

    // Connect to socket with auth
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected for chat');
      newSocket.emit('join-chat', { foodId, userId: user._id });
    });

    newSocket.on('new-message', (message) => {
      console.log('New message received:', message);
      if (message.foodId === foodId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });

    newSocket.on('user-typing', (data) => {
      if (data.foodId === foodId && data.userId !== user._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user, token, foodId]);

  // Fetch messages
  useEffect(() => {
    if (!user) {
      toast.error('Please login to chat');
      onClose();
      return;
    }
    fetchMessages();
    focusInput();
  }, [user, foodId]);

  // FIXED: Updated fetchMessages with proper 403 handling
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages(foodId);
      setMessages(data.messages || data);
      // Mark messages as read
      await markAsRead(foodId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to continue chatting');
        onClose();
      } else if (error.response?.status === 403) {
        // For 403, show a friendly message but don't close the chat
        // The user can still send messages to inquire
        setError('You can view messages only after the donor responds. Send a message to start the conversation.');
        toast.info('Send a message to start chatting with the donor');
        setMessages([]);
      } else if (error.response?.status === 404) {
        toast.error('Food not found');
        onClose();
      } else {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleTyping = () => {
    if (socket && newMessage.trim()) {
      socket.emit('typing', { foodId, userId: user._id, receiverId: donorId });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        // Typing stopped
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!user) {
      toast.error('Please login to send messages');
      return;
    }

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    // Clear error when sending first message
    if (error) setError(null);

    const messageData = {
      foodId: foodId,
      receiverId: donorId,
      message: messageText
    };

    console.log('Sending message:', messageData);

    // Optimistic update
    const tempMessage = {
      _id: Date.now(),
      food: foodId,
      sender: { _id: user._id, name: user.name },
      receiver: donorId,
      message: messageText,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const response = await sendMessage(messageData);
      console.log('Message sent successfully:', response);
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? { ...response, status: 'sent' } : msg
      ));
      
      // Emit via socket
      if (socket) {
        socket.emit('send-message', { 
          foodId, 
          receiverId: donorId, 
          message: messageText,
          senderId: user._id,
          senderName: user.name
        });
      }
      
      // If we had a 403 error before, now it's resolved
      if (error) {
        setError(null);
        toast.success('Message sent! The donor will respond shortly.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      // Update message status to error
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? { ...msg, status: 'error' } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMinutes = Math.floor((now - messageDate) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return messageDate.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-600 mb-4">Please login to chat with the donor</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[500px] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-500 to-green-600 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <FaUser className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{donorName || 'Donor'}</h3>
              <p className="text-xs text-green-100">
                {foodName || 'Food Donation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <FaSpinner className="animate-spin text-2xl text-green-500" />
            </div>
          ) : error ? (
            // Show error message with info icon - User can still send messages
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="bg-blue-50 rounded-full p-4 mb-4">
                <FaInfoCircle className="text-blue-500 text-3xl" />
              </div>
              <p className="text-gray-700 font-medium mb-2">No messages yet</p>
              <p className="text-gray-500 text-sm mb-3">{error}</p>
              <p className="text-green-600 text-sm flex items-center gap-1">
                <FaPaperPlane size={12} />
                Type a message below to start the conversation
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <FaPaperPlane className="text-green-600 text-2xl" />
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Start a conversation about this donation
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn = msg.sender?._id === user._id || msg.senderId === user._id;
              return (
                <div
                  key={msg._id || idx}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <p className="text-xs text-gray-500 mb-1 ml-1">
                        {msg.sender?.name || donorName || 'Donor'}
                      </p>
                    )}
                    <div
                      className={`relative p-3 rounded-2xl ${
                        isOwn
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs opacity-75">
                          {formatTime(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <span className="text-xs">
                            {msg.status === 'sending' && <FaClock className="text-white" />}
                            {msg.status === 'sent' && <FaCheck className="text-white" />}
                            {msg.status === 'delivered' && <FaCheckDouble className="text-white" />}
                            {msg.status === 'read' && <FaCheckDouble className="text-white" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder={`Message ${donorName || 'donor'}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </div>
          {error && (
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <FaInfoCircle size={10} />
              Send a message to start the conversation
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatBox;