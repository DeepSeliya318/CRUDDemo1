// src/utils/asyncStorage.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token
export const saveToken = async token => {
  try {
    await AsyncStorage.setItem('token', token);
    console.log('✅ Token saved!');
  } catch (err) {
    console.error('❌ Save token error:', err);
  }
};

// Get token
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (err) {
    console.error('❌ Get token error:', err);
    return null;
  }
};

// Remove token (logout)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('✅ Token removed!');
  } catch (err) {
    console.error('❌ Remove token error:', err);
  }
};
