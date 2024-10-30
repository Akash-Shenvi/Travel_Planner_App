import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const router = useRouter();
  
  const [input, setInput] = useState(''); // For email or phone input
  const [otp, setOtp] = useState(''); // For OTP input
  const [otpSent, setOtpSent] = useState(false); // Track OTP request

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Function to simulate OTP request
  const handleRequestOtp = () => {
    if (input) {
      setOtpSent(true); // Simulate OTP sent status
      // Add backend request logic here
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = () => {
    if (otp) {
      // Logic to verify OTP
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons style={styles.backIcon} name="arrow-back" size={29} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>

      {/* Input for Email or Phone Number */}
      <View>
        <Text style={styles.label}>Email or Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email or Phone Number"
          value={input}
          onChangeText={setInput}
          keyboardType="default" // Can change to 'email-address' or 'phone-pad' if needed
        />
      </View>

      {/* Request OTP Button */}
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={handleRequestOtp}
      >
        <Text style={styles.buttonText}>Request OTP</Text>
      </TouchableOpacity>

      {/* OTP Input and Verify OTP Button (only shows if OTP is sent) */}
      {otpSent && (
        <>
          <View>
            <Text style={styles.label}>Enter OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => router.replace('auth/forgot-pass-after-otp')}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Back to Sign In Button */}
      <TouchableOpacity
        onPress={() => router.replace('auth/sign-in')}
        style={styles.signInContainer}
      >
        <Text style={styles.signInText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 40,
    backgroundColor: 'white',
    height: '100%',
  },
  backIcon: {
    marginBottom: 15,
  },
  title: {
    fontFamily: 'outfit-Bold',
    fontSize: 25,
    marginTop: 10,
  },
  label: {
    fontFamily: 'outfit-Medium',
    marginTop: 30,
    fontSize: 14,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'grey',
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
});
