import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ContactUs = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [feedback, setFeedback] = useState('');
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);

  const sendFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Feedback Required', 'Please enter your feedback.');
      return;
    }

    try {
      const response = await fetch('https://sunbeam-pet-octopus.ngrok-free.app/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Thank You!', 'Your feedback has been sent successfully.');
        setFeedback('');
        setShowFeedbackBox(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to send feedback.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.heading}>Contact Us</Text>
      <Text style={styles.description}>
        Have questions, suggestions, or need assistance? Feel free to reach out!
      </Text>

      {/* Developer Info Section */}
      <Text style={styles.subHeading}>About the Developer</Text>
      <Text style={styles.description}>
        We are Team Travel, dedicated to providing exceptional support and ensuring a smooth experience with the Travel Planner app. For any questions, suggestions, or assistance, please don’t hesitate to reach out to us. Your feedback helps us improve and serve you better.
      </Text>
      <Text style={styles.contactInfo}>
        Email:{' '}
        <Text
          style={styles.contactLink}
          onPress={() => Linking.openURL('mailto:aacmovies906@gmail.com')}
        >
          aacmovies906@gmail.com
        </Text>
      </Text>

      {/* Show Feedback Button */}
      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={() => setShowFeedbackBox(true)}
      >
        <Text style={styles.feedbackButtonText}>Send Feedback</Text>
      </TouchableOpacity>

      {/* Feedback Modal */}
      {showFeedbackBox && (
        <Modal transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.feedbackBox}>
              <Text style={styles.modalHeading}>We Value Your Feedback</Text>
              <TextInput
                style={styles.feedbackInput}
                multiline
                placeholder="If you find any bugs or have suggestions, please let us know here..."
                value={feedback}
                onChangeText={setFeedback}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowFeedbackBox(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={sendFeedback}>
                  <Ionicons name="send" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
    padding: 5,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A2A72',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  contactLink: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  feedbackButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  feedbackInput: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default ContactUs;
