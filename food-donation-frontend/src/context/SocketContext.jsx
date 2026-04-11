import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user || !token) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, token]);

  const value = {
    socket,
    onlineUsers,
    emit: (event, data) => socket?.emit(event, data),
    on: (event, callback) => socket?.on(event, callback),
    off: (event, callback) => socket?.off(event, callback)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};