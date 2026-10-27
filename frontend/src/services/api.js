import axios from 'axios';
import { API_URL } from '../api/config';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor: agrega el token a cada petición si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
