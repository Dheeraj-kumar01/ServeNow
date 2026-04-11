import React, { useState, useEffect } from 'react';
import { getUserChats } from '../../services/chat';
import { FaComments, FaSpinner, FaUser, FaClock, FaCheckCircle, FaHourglassHalf, FaStore } from 'react-icons/fa';
import ChatBox from '../../components/chat/ChatBox';
import toast from 'react-hot-toast';

const DonorChat = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchChats = async () => {
    try {
      const data = await getUserChats();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
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

  const getFoodStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <FaCheckCircle className="text-green-500" />;
      case 'claimed':
      case 'pending':
        return <FaHourglassHalf className="text-yellow-500" />;
      case 'completed':
        return <FaCheckCircle className="text-blue-500" />;
      default:
        return <FaComments className="text-gray-400" />;
    }
  };

  const getFoodStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'claimed':
        return 'Claimed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      default:
        return status || 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Chat with receivers about your food donations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chat List Sidebar */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700">Conversations</h2>
              <p className="text-xs text-gray-500 mt-1">{chats.length} active chats</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-8 text-center">
                  <FaComments className="text-5xl text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    When someone messages you about your food, it will appear here
                  </p>
                </div>
              ) : (
                chats.map(chat => (
                  <button
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedChat?._id === chat._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 truncate">
                            {chat.otherUser?.name || 'User'}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatTime(chat.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-0.5">
                          {chat.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <FaStore className="text-gray-400 text-xs" />
                            <span className="text-xs text-gray-500 truncate max-w-[120px]">
                              {chat.food?.name || 'Food Item'}
                            </span>
                          </div>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <div className="flex items-center gap-1 text-xs">
                            {getFoodStatusIcon(chat.food?.status)}
                            <span className="text-gray-500 capitalize">
                              {getFoodStatusText(chat.food?.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            {selectedChat ? (
              <ChatBox
                donorId={selectedChat.otherUser?._id}
                foodId={selectedChat.food?._id}
                donorName={selectedChat.otherUser?.name}
                foodName={selectedChat.food?.name}
                onClose={() => setSelectedChat(null)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaComments className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Conversation Selected</h3>
                <p className="text-gray-500 max-w-sm">
                  Select a conversation from the list to start chatting with receivers
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorChat;