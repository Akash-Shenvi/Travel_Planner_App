import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

export default function SignUp() {
  const navigation = useNavigation();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpScreen, setIsOtpScreen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleRegistration = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Phone number should be exactly 10 digits.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }

    try {
      const requestData = {
        name,
        email,
        password,
        phone,
      };

      const response = await axios.post('http://192.168.27.138:5000/signup', requestData);

      if (response.status === 201) {
    setIsOtpScreen(true); // Navigate to OTP screen or enable OTP input
    Alert.alert('OTP Sent', 'An OTP has been sent to your email.');
  } else if (response.status === 409) {
    Alert.alert('Alert', 'User Already Exists');
  } else {
    Alert.alert('Alert', 'Unexpected response from the server. Please try again.');
  }
} catch (error) {
  const errorMessage =
    error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : 'Registration failed. Please try again.';
  
  Alert.alert('Alert', errorMessage);
  console.error('Error:', error.response ? error.response.data : error.message);
}
  };

  const handleOtpVerification = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.27.138:5000/verify_otp', { email, otp });

      if (response.status === 200) {
        setModalVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          setModalVisible(false);
          router.replace('auth/sign-in');
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Wrong OTP', 'The OTP entered is incorrect. Please try again.');
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons style={{ marginBottom: 15 }} name="arrow-back" size={29} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'outfit-Bold', fontSize: 25, marginTop: 10 }}>
          {isOtpScreen ? 'Verify OTP' : 'Create New Account'}
        </Text>

        {!isOtpScreen ? (
          <>
            <View>
              <Text style={{ fontFamily: 'outfit-Medium', marginTop: 30, fontSize: 14 }}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter Name'
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text style={{ fontFamily: 'outfit-Medium', marginTop: 20, fontSize: 14 }}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter Email'
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text style={{ fontFamily: 'outfit-Medium', marginTop: 20, fontSize: 14 }}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter Phone'
                keyboardType='phone-pad'
                value={phone}
                onChangeText={setPhone}
              />
            </View>

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
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text style={{ fontFamily: 'outfit-Medium', marginTop: 20, fontSize: 14 }}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                  placeholder='Confirm Password'
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.buttonContainer} onPress={handleRegistration}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View>
              <Text style={{ fontFamily: 'outfit-Medium', marginTop: 30, fontSize: 14 }}>Enter OTP</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter OTP'
                keyboardType='numeric'
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <TouchableOpacity style={styles.buttonContainer} onPress={handleOtpVerification}>
              <Text style={styles.buttonText}>Verify OTP</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={() => router.replace('auth/sign-in')} style={styles.signInContainer}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
      >
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <Text style={styles.successText}>Verification Successful</Text>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'grey',
    fontFamily: 'outfit',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'grey',
    paddingHorizontal: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontFamily: 'outfit',
    fontSize: 14,
  },
  buttonContainer: {
    padding: 15,
    backgroundColor: 'black',
    borderRadius: 50,
    marginTop: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'outfit-Bold',
    fontSize: 16,
  },
  signInContainer: {
    marginTop: 30,
    alignSelf: 'center',
  },
  signInText: {
    fontFamily: 'outfit-Bold',
    color: 'black',
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'outfit-Bold',
    fontSize: 18,
  },
});
