import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearSession } from "../utils/storage";

const api = axios.create({
  baseURL: "https://padips2back.onrender.com/auth",
  timeout: 10000,
  headers: {
    "x-api-key": "PADIPS2_SECERET_KEY",
  },
});

/* REQUEST */
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* RESPONSE */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (
      err.response?.status === 403 &&
      err.response?.data?.forceLogout
    ) {
      await clearSession();
    }
    return Promise.reject(err);
  }
);



export default api;
