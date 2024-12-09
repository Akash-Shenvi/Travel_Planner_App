import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SignIn() {
  const navigation = useNavigation();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleSignIn = async () => {
    setErrorMessage('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const userData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch('http://192.168.27.138:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.status === 200 && result) {
        setModalVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          setModalVisible(false);
          router.replace('Home');
        }, 2000);
      } else if (response.status === 404) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <View style={{ padding: 15, paddingTop: 60, height: '100%', backgroundColor: 'white' }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons style={{ marginBottom: 15 }} name="arrow-back" size={29} color="black" />
      </TouchableOpacity>
      <Text style={{ fontSize: 30, fontFamily: 'outfit-Bold' }}>Let's Sign You In</Text>
      <Text style={{ fontSize: 30, color: 'grey', fontFamily: 'outfit', marginTop: 20 }}>Welcome Back</Text>
      <Text style={{ fontSize: 30, color: 'grey', fontFamily: 'outfit', marginTop: 10 }}>You've Been Missed</Text>

      {/* Email */}
      <View>
        <Text style={{ fontFamily: 'outfit-Medium', marginTop: 50 }}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter Email'
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password */}
      <View>
        <Text style={{ fontFamily: 'outfit-Medium', marginTop: 20, fontSize: 14 }}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholder='Enter Password'
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => router.push('auth/forgot-pass')}>
        <Text style={{ color: 'blue', fontFamily: 'outfit-Medium', marginTop: 10, textAlign: 'right' }}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity 
        onPress={handleSignIn}
        style={{ padding: 20, backgroundColor: 'black', borderRadius: 99, marginTop: 30 }}>
        <Text style={{ color: 'white', fontFamily: 'outfit', textAlign: 'center', fontSize: 20 }}>Sign In</Text>
      </TouchableOpacity>

      {/* Display error message if credentials are incorrect */}
      {errorMessage ? (
        <Text style={{ color: 'red', fontFamily: 'outfit-Medium', marginTop: 10, textAlign: 'center' }}>
          {errorMessage}
        </Text>
      ) : null}

      {/* Create Account */}
      <TouchableOpacity
        onPress={() => router.replace('auth/sign-up')}
        style={{ padding: 20, backgroundColor: 'white', borderRadius: 99, marginTop: 30, borderWidth: 2 }}>
        <Text style={{ fontFamily: 'outfit', textAlign: 'center', fontSize: 20 }}>Create Account</Text>
      </TouchableOpacity>

      {/* Modal for "Sign In Successful" */}
      <Modal transparent={true} visible={modalVisible} animationType="none">
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <Text style={styles.successText}>Sign In Successful</Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 99,
    borderColor: 'grey',
    fontFamily: 'outfit',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 99,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'outfit',
  },
  iconContainer: {
    paddingHorizontal: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    fontFamily: 'outfit-Bold',
    color: 'green',
  },
});
