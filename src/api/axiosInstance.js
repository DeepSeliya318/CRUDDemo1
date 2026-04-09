// src/api/axiosInstance.js

import axios from 'axios';
import { getToken } from '../utils/asyncStorage';

const axiosInstance = axios.create({
  // Android Emulato
  baseURL: 'https://crudbackend-g4hg.onrender.com',

  timeout: 30000,
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

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (
      error?.message === 'Network Error' ||
      error?.code === 'ECONNABORTED' ||
      (!error?.response && error?.request)
    ) {
      return Promise.reject(
        new Error(
          'Network error. Check your internet, ensure the backend URL is reachable, and if you are using a local backend on Android emulator use 10.0.2.2 instead of localhost.',
        ),
      );
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
