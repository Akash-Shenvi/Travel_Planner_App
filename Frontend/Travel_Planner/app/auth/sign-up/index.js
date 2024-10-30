import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';

export default function SignUp() {
  const navigation = useNavigation();
  const router = useRouter();

  const [name, setName] = useState('');         // Name state
  const [email, setEmail] = useState('');       // Email state
  const [phone, setPhone] = useState('');       // Phone state
  const [password, setPassword] = useState(''); // Password state
  const [modalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle for showing password
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleSubmit = async () => {
    // Check if all required fields are filled
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill out all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Validate phone number length
    if (phone.length !== 10) {
      Alert.alert('Invalid Phone Number', 'Phone number should be exactly 10 digits.');
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    try {
      // Construct the request payload
      const requestData = {
        name,
        email,
        password,
        phone,
      };

      // Make POST request to the backend
      const response = await axios.post('http://192.168.251.138:5000/signup', requestData);

      if (response.status === 201) {
        // Show success modal
        setModalVisible(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        // After 2 seconds, close modal and navigate to sign-in
        setTimeout(() => {
          setModalVisible(false);
          router.replace('auth/sign-in');
        }, 2000);
      }
    } catch (error) {
      // Handle errors during the API request
      const errorMessage = error.response && error.response.data ? error.response.data.message : 'Registration failed. Please try again.';
      Alert.alert('User Already Exists'); // Show detailed error message
      console.error('Error:', error.response ? error.response.data : error.message); // Log error details
    }
  };

  return (
    <View style={{ padding: 15, marginTop: 40, backgroundColor: 'white', height: '100%' }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons style={{ marginBottom: 15 }} name="arrow-back" size={29} color="black" />
      </TouchableOpacity>
      <Text style={{ fontFamily: 'outfit-Bold', fontSize: 25, marginTop: 10 }}>
        Create New Account
      </Text>

      {/* Name */}
      <View>
        <Text style={{ fontFamily: 'outfit-Medium', marginTop: 30, fontSize: 14 }}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter Name'
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Email */}
      <View>
        <Text style={{ fontFamily: 'outfit-Medium', marginTop: 20, fontSize: 14 }}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter Email'
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Phone */}
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
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="grey" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Account Button */}
      <TouchableOpacity style={styles.buttonContainer} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity onPress={() => router.replace('auth/sign-in')} style={styles.signInContainer}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      {/* Modal for "Registration Successful" */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
      >
        <View style={styles.modalBackground}>
          <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
            <Text style={styles.successText}>Registration Successful</Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
  },
  buttonText: {
    color: 'white',
    fontFamily: 'outfit',
    textAlign: 'center',
    fontSize: 18,
  },
  signInContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 2,
  },
  signInText: {
    fontFamily: 'outfit',
    textAlign: 'center',
    fontSize: 18,
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
