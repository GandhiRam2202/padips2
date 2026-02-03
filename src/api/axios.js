import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearSession } from '../utils/storage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'x-api-key': process.env.EXPO_PUBLIC_API_KEY,
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 403 && err.response?.data?.forceLogout) {
      await clearSession();
    }
    return Promise.reject(err);
  }
);

export default api;
