import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, signupUser, verifyToken } from '../services/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      verifyTokenFunction();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyTokenFunction = async () => {
    try {
      const userData = await verifyToken(token);
      setUser(userData);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginUser(email, password);
      // Handle response correctly
      const { token, ...userData } = response;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.name}!`);
      return { success: true, user: userData };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, message: error.response?.data?.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await signupUser(userData);
      console.log('Signup response:', response);
      
      // Handle response correctly
      const { token, ...user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      toast.success('Account created successfully!');
      return { success: true, user: user };
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      loading,
      updateUser,
      isAuthenticated: !!user,
      isDonor: user?.role === 'donor',
      isReceiver: user?.role === 'receiver'
    }}>
      {children}
    </AuthContext.Provider>
  );
};