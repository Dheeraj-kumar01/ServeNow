import api from './api';

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyToken = async (token) => {
  // Set the token in headers
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  // Use /me endpoint instead of /verify
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

export const logoutUser = async () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};