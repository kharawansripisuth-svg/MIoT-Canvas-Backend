// src/services/api.js
import axios from 'axios';

// สร้าง instance ของ axios
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api',
  withCredentials: false // ไม่ใช้ cookie ตอนนี้
});

// interceptor สำหรับ request — ใส่ token ทุกครั้ง
api.interceptors.request.use(config => {
  const token = localStorage.getItem('api_token'); // ดึงจาก localStorage หรือ Pinia/Vuex
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// interceptor สำหรับ response — ตรวจสอบ error เช่น token หมดอายุ
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized - redirect to login');
      // ตัวอย่าง: ลบ token และไปหน้า login
      localStorage.removeItem('api_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;