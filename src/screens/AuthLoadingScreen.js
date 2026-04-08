import React, {useEffect, useRef} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {getToken} from '../utils/asyncStorage';
import axiosInstance from '../api/axiosInstance';
import {setAuthState, logoutUser} from '../redux/slices/authSlice';

const AuthLoadingScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const bootedRef = useRef(false);
  const didNavigateRef = useRef(false);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    let mounted = true;

    const safeReplace = name => {
      if (!mounted) return;
      if (didNavigateRef.current) return;
      didNavigateRef.current = true;
      navigation.replace(name);
    };

    const boot = async () => {
      const token = await getToken();

      if (!token) {
        safeReplace('Login');
        return;
      }

      if (mounted) dispatch(setAuthState({token}));

      const endpoints = ['/auth/me', '/users/me', '/me'];
      for (const url of endpoints) {
        try {
          const res = await axiosInstance.get(url);
          const user = res?.data?.user ?? res?.data;
          if (user) {
            if (mounted) dispatch(setAuthState({user}));
          }
          safeReplace('Home');
          return;
        } catch (err) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            if (mounted) dispatch(logoutUser());
            safeReplace('Login');
            return;
          }
        }
      }

      safeReplace('Home');
    };

    boot();
 
    return () => {
      mounted = false;
    };
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AuthLoadingScreen;
