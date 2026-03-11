// src/services/authService.js
import api from './api';

export const login = async (email, password) => {
  try {
    const res = await api.post('/login', { email, password });
    if (!res.data?.token) {
      throw new Error('Login failed: No token returned from server');
    }
    localStorage.setItem('api_token', res.data.token);
    return res.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error; // ส่งต่อให้ component จัดการ
  }
};

export const logout = async () => {
  try {
    const res = await api.post('/logout');
    console.log('Logging out...');
    localStorage.removeItem('api_token');
    return res.data;
  } catch (error) {
    console.error('Logout error:', error.message);
    // จะลบ token ต่อไปหรือไม่ ขึ้นอยู่กับกรณีที่ต้องการ
    localStorage.removeItem('api_token');
    throw error;
  }
};