import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const router = useRouter();

  const [input, setInput] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const handleRequestOtp = async () => {
    if (!isValidEmail(input)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch('http://192.168.160.138:5000/otpreq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input }),
      });
      const result = await response.json();

      if (response.ok) {
        setOtpSent(true);
        Alert.alert("Success", result.response);
      } else {
        Alert.alert("Error", result.response);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = () => {
    if (otp) {
      setOtpVerified(true);
    }
  };

  const handleResetPassword = async () => {
    if (!isValidPassword(newPassword)) {
      Alert.alert(
        "Week Password",
        "Password must be at least 6 characters long, include one uppercase letter, one number, and one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://192.168.160.138:5000/password_reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: input, otp, new_password: newPassword }),
      });
      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", result.response);
        router.replace('auth/sign-in');
      } else {
        Alert.alert("Error", result.response);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons style={styles.backIcon} name="arrow-back" size={29} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>

      {!otpVerified && (
        <>
          <View>
            <Text style={styles.label}>Email </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Email "
              value={input}
              onChangeText={setInput}
              keyboardType="default"
            />
          </View>

          {!otpSent && (
            <TouchableOpacity style={styles.buttonContainer} onPress={handleRequestOtp}>
              <Text style={styles.buttonText}>Request OTP</Text>
            </TouchableOpacity>
          )}

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
              <TouchableOpacity style={styles.buttonContainer} onPress={handleVerifyOtp}>
                <Text style={styles.buttonText}>Verify OTP</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}

      {otpVerified && (
        <>
          <View>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter New Password"
                secureTextEntry={!passwordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="grey"
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            </View>
          </View>
          <View>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm New Password"
                secureTextEntry={!confirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Ionicons
                name={confirmPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="grey"
                onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              />
            </View>
          </View>
          <TouchableOpacity style={styles.buttonContainer} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => router.replace('auth/sign-in')} style={styles.signInContainer}>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 50,
    borderColor: 'grey',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  passwordInput: {
    flex: 1,
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
