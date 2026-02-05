import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearSession } from '../utils/storage';
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig.extra.API_BASE_URL;
const API_KEY = Constants.expoConfig.extra.API_KEY;


const api = axios.create({
  
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'x-api-key': API_KEY,
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
