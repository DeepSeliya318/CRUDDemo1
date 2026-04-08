// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveToken, removeToken } from '../../utils/asyncStorage';
import axiosInstance from '../../api/axiosInstance';

// ─────────────────────────────────
// REGISTER API CALL
// ─────────────────────────────────
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Register failed!';
      return rejectWithValue(message);
    }
  },
);

export const logoutUserRequest = createAsyncThunk(
  'auth/logoutUserRequest',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/logout');
      await removeToken();
      return true;
    } catch (err) {
      await removeToken();
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Logout failed!';
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────
// LOGIN API CALL
// ─────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', userData);

      // Save token to AsyncStorage
      await saveToken(response.data.token);

      console.log('hhhhh', response.data);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Login failed!';
      return rejectWithValue(message);
    }
  },
);

// ─────────────────────────────────
// AUTH SLICE
// ─────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
    success: false,
  },

  reducers: {
    setAuthState: (state, action) => {
      if (action.payload?.token !== undefined) {
        state.token = action.payload.token;
      }
      if (action.payload?.user !== undefined) {
        state.user = action.payload.user;
      }
    },

    // Logout action
    logoutUser: state => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.success = false;
      removeToken(); // remove from AsyncStorage
      console.log('✅ Logged out!');
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Clear success
    clearSuccess: state => {
      state.success = false;
    },
  },

  extraReducers: builder => {
    // ── Register Cases ──
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        console.log('✅ Register success!');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('❌ Register failed:', action.payload);
      });

    // ── Login Cases ──
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.success = true;
        console.log('✅ Login success!');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.log('❌ Login failed:', action.payload);
      });

    builder
      .addCase(logoutUserRequest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUserRequest.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.success = false;
      })
      .addCase(logoutUserRequest.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { setAuthState, logoutUser, clearError, clearSuccess } =
  authSlice.actions;
export default authSlice.reducer;
