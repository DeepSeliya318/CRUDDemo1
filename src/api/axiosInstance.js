// src/api/axiosInstance.js

import axios from 'axios';
import { getToken } from '../utils/asyncStorage';

const axiosInstance = axios.create({
  // ✅ Android Emulato
  baseURL: 'http://192.168.56.1:3000',

  // ✅ iOS Simulator
  // baseURL: 'http://localhost:3000',

  // ✅ Real Device (use your PC IP address)
  // baseURL: 'http://192.168.1.100:3000',

  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async config => {
  const token = await getToken();
  console.log(token);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
