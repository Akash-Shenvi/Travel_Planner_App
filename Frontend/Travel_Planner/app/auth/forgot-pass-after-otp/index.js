import { View, Text, TouchableOpacity, TextInput, StyleSheet, Modal, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSubmit = () => {
    if (newPassword === confirmPassword) {
      // Show success modal
      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        router.replace('auth/sign-in'); // Redirect to sign-in screen after success
      }, 2000); // Auto-hide modal after 2 seconds
    } else {
      console.log('Passwords do not match');
    }
  };

  return (
    <View
      style={{
        padding: 15,
        marginTop: 40,
        backgroundColor: 'white',
        height: '100%',
      }}
    >
      <Text
        style={{
          fontFamily: 'outfit-Bold',
          fontSize: 25, // Reduced font size
          marginTop: 10,
        }}
      >
        Reset Your Password
      </Text>

      {/* New Password */}
      <View>
        <Text style={{ fontFamily: 'outfit-Medium', marginTop: 30, fontSize: 14 }}>New Password</Text>
        <TextInput
          style={styles.input}
          placeholder='Enter New Password'
          secureTextEntry={true}
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      {/* Confirm New Password */}
      <View>
        <Text style={{ fontFamily: 'outfit-Medium', marginTop: 20, fontSize: 14 }}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          placeholder='Confirm New Password'
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {/* Success Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* <Image
              source={require('./../assets/images/tick.png')} // Add your tick image here
              style={styles.tickImage}
            /> */}
            <Text style={styles.successText}>Password Reset Successfully!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 12, // Reduced padding
    borderWidth: 1,
    borderRadius: 50, // Slightly smaller radius
    borderColor: 'grey',
    fontFamily: 'outfit',
    fontSize: 14, // Reduced font size
  },
  buttonContainer: {
    padding: 15, // Reduced padding
    backgroundColor: 'black',
    borderRadius: 50, // Slightly smaller radius
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'outfit',
    textAlign: 'center',
    fontSize: 18, // Reduced font size
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  tickImage: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  successText: {
    fontFamily: 'outfit-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
