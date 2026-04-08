// src/screens/HomeScreen.js

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUserRequest } from '../redux/slices/authSlice';
import { fetchConversations } from '../api/chatApi';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  console.log(user);

  const didAutoNavRef = useRef(false);
  const inFlightRef = useRef(false);

  const [checkingChats, setCheckingChats] = useState(true);
  const [hasChats, setHasChats] = useState(false);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      (async () => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;

        let didNavigate = false;
        try {
          setCheckingChats(true);
          const res = await fetchConversations({ page: 1, limit: 1 });
          const items = Array.isArray(res?.data) ? res.data : [];
          const nextHasChats = items.length > 0;
          setHasChats(nextHasChats);

          if (nextHasChats && !didAutoNavRef.current) {
            didAutoNavRef.current = true;
            didNavigate = true;
            navigation.replace('Conversations');
            return;
          }
        } catch (e) {
          setHasChats(false);
        } finally {
          if (!didNavigate) setCheckingChats(false);
          inFlightRef.current = false;
        }
      })();
    });
    return unsub;
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          dispatch(logoutUserRequest());
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  if (checkingChats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#075e54" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>🎉 Welcome! {user?.name}</Text>

      <View style={styles.actionsWrap}>
        {hasChats ? (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Conversations')}
          >
            <Text style={styles.primaryText}>Chats</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Users')}
          >
            <Text style={styles.primaryText}>Start New Chat</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075e54',
    marginBottom: 8,
  },
  actionsWrap: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: 16,
  },
  primaryButton: {
    backgroundColor: '#075e54',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#e3f2f1',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  secondaryText: {
    color: '#075e54',
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    color: '#777',
    marginBottom: 24,
  },
  tokenBox: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    marginBottom: 24,
  },
  tokenLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#075e54',
    marginBottom: 6,
  },
  token: {
    fontSize: 11,
    color: '#555',
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
