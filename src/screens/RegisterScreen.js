// src/screens/RegisterScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerUser,
  clearError,
  clearSuccess,
} from '../redux/slices/authSlice';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(state => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ toggle state

  // ── Show error alert ──
  useEffect(() => {
    if (error) {
      Alert.alert('❌ Error', error);
      dispatch(clearError());
    }
  }, [error]);

  // ── On success go to Login ──
  useEffect(() => {
    if (success) {
      Alert.alert('✅ Success', 'login successfully!');
      dispatch(clearSuccess());
      navigation.navigate('Login');
    }
  }, [success]);

  // ── Handle Register ──
  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('⚠️ Warning', 'Please fill all fields!');
      return;
    }
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Register</Text>

      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#999"
      />

      {/* ✅ Password with Show/Hide toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // ✅ true = hide, false = show
          placeholderTextColor="#999"
        />

        {/* Eye Toggle Button */}
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Password hint text */}
      <Text style={styles.passwordHint}>
        {password.length > 0
          ? password.length < 6
            ? '❌ Password too short (min 6 characters)'
            : '✅ Password looks good!'
          : ''}
      </Text>

      {/* Register Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      {/* Go to Login */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>
          Already have account?
          <Text style={styles.link}> Login here</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075e54',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 16,
    color: '#000', // ✅ typed text color black
  },

  // ✅ Password row — input + eye button together
  passwordContainer: {
    flexDirection: 'row', // side by side
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 6,
  },
  passwordInput: {
    flex: 1, // take all available space
    padding: 14,
    fontSize: 15,
    color: '#000', // ✅ typed text color black
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeText: {
    fontSize: 18,
  },

  // ✅ Password strength hint
  passwordHint: {
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 4,
    color: '#666',
  },

  button: {
    backgroundColor: '#075e54',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  link: {
    color: '#075e54',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
