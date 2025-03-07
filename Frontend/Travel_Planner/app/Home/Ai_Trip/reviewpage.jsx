import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, Modal, TouchableOpacity, Alert, ActivityIndicator, ScrollView 
} from 'react-native';
import { useLocalSearchParams,useNavigation } from 'expo-router';


const ReviewPage = () => {
  const params = useLocalSearchParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tripName, setTripName] = useState('');
  const [generated, setGenerated] = useState(false);
  const navigation = useNavigation();
useEffect(() => {
  navigation.setOptions({ 
    headerShown: true, // Show the header
    title: '', // Hide the title
  });
}, [navigation]);

  useEffect(() => {
    if (!generated) {
      fetchTripData();
      setGenerated(true); // Prevents re-fetching on re-render
    }
  }, []);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://sunbeam-pet-octopus.ngrok-free.app/generate_trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: params.name,
          startDate: params.startDate,
          endDate: params.endDate,
          totalDays: params.totalDays,
          title: params.title,
          budget: params.budget,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate trip details. Please try again.');
      }

      const data = await response.json();
      console.log('Trip Data:', data);
      setTripData(data);
    } catch (err) {
      console.error('Error fetching trip data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveTrip = async () => {
    if (!tripName.trim()) {
      Alert.alert('Error', 'Please enter a valid trip name.');
      return;
    }

    try {
      const response = await fetch('https://sunbeam-pet-octopus.ngrok-free.app/save_trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripName, tripData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save trip. Please try again.');
      }

      Alert.alert('Success', 'Trip saved successfully!');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save trip.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!tripData) {
    return (
      <View style={styles.center}>
        <Text>No trip details available.</Text>
      </View>
    );
  }

  const { trip_details, itinerary, notes } = tripData;

  return (
    <>
  <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
  <Text style={styles.title}>Review Your Trip</Text>

  {/* Trip Details Section */}
  <View style={styles.section}>
    <Text style={styles.header}>Trip Details</Text>
    <Text style={styles.detail}>Destination: {trip_details?.destination || 'Not specified'}</Text>
    <Text style={styles.detail}>Dates: {trip_details?.dates || 'Not specified'}</Text>
    <Text style={styles.detail}>Budget: {trip_details?.budget || 'Not specified'}</Text>
    <Text style={styles.detail}>Duration: {trip_details?.duration || 'Not specified'}</Text>
  </View>

  {/* Itinerary Section */}
  <View style={styles.section}>
    <Text style={styles.header}>Itinerary</Text>
    {itinerary.map((day, index) => (
      <View key={index} style={styles.daySection}>
        <Text style={styles.dayHeader}>{day.day}</Text>
        {day.activities.map((activity, idx) => (
          <View key={idx} style={styles.activity}>
            <Text style={styles.activityDesc}>{activity.description}</Text>
            <Text style={styles.activityDetail}>Location: {activity.location}</Text>
            <Text style={styles.activityDetail}>Estimated Cost: {activity.estimated_cost}</Text>
            {activity.notes && <Text style={styles.activityNote}>Notes: {activity.notes}</Text>}
          </View>
        ))}
      </View>
    ))}
  </View>

  {/* Notes Section */}
  <View style={styles.section}>
    <Text style={styles.header}>Important Notes</Text>
    {notes.map((note, index) => (
      <Text key={index} style={styles.note}>• {note}</Text>
    ))}
  </View>

  {/* Save Button (Now Wrapped in a View) */}
  <View style={styles.saveButtonContainer}>
    <TouchableOpacity style={styles.saveButton} onPress={() => setModalVisible(true)}>
      <Text style={styles.saveButtonText}>Save Trip</Text>
    </TouchableOpacity>
  </View>
</ScrollView>


      {/* Save Trip Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Trip Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter trip name"
              value={tripName}
              onChangeText={setTripName}
            />
            <TouchableOpacity style={styles.modalButton} onPress={saveTrip}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F8FF', // Light blue background
    paddingHorizontal: 20, 
    paddingVertical: 30 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F0F8FF' 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#1E3A8A', // Deep blue
    marginBottom: 20, 
    textAlign: 'center' 
  },
  section: { 
    marginBottom: 20, 
    backgroundColor: '#FFFFFF', 
    padding: 15, 
    borderRadius: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.15, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 6, 
    elevation: 5,
    borderLeftWidth: 6, 
    borderLeftColor: '#4A90E2' // Soft blue border on the left
  },
  header: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#2C3E50' // Dark slate gray
  },
  detail: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 5 
  },
  daySection: { 
    marginBottom: 20 
  },
  dayHeader: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FF5733', // Vibrant coral red
    marginBottom: 10 
  },
  activity: { 
    marginBottom: 10, 
    backgroundColor: '#E3F2FD', // Light blue shade
    padding: 12, 
    borderRadius: 10, 
    borderLeftWidth: 4, 
    borderLeftColor: '#3498DB' // Blue accent
  },
  activityDesc: { 
    fontSize: 16, 
    color: '#333', 
    fontWeight: 'bold' 
  },
  activityDetail: { 
    fontSize: 14, 
    color: '#555' 
  },
  activityNote: { 
    fontSize: 14, 
    fontStyle: 'italic', 
    color: '#888' 
  },
  note: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 5, 
    backgroundColor: '#FEF5E7', // Soft pastel orange
    padding: 10, 
    borderRadius: 8, 
    borderLeftWidth: 4, 
    borderLeftColor: '#F39C12' // Warm yellow accent
  },
  errorText: { 
    color: '#E74C3C', // Red error text
    fontSize: 16 
  },

  /*** Save Button Styling ***/
  saveButtonContainer: { 
    alignItems: 'center', 
    marginTop: 20,
    paddingBottom: 40
  },
  saveButton: { 
    backgroundColor: '#2ECC71', // Green color
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 10, 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.2, 
    shadowOffset: { width: 0, height: 3 }, 
    shadowRadius: 5, 
    elevation: 6 
  },
  saveButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  /*** Modal Styling ***/
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: 340, 
    backgroundColor: '#FFFFFF', 
    padding: 25, 
    borderRadius: 14, 
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 6, 
    elevation: 6 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 12, 
    color: '#2C3E50', 
    textAlign: 'center' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#AAB7B8', 
    padding: 14, 
    marginBottom: 15, 
    borderRadius: 8, 
    fontSize: 16, 
    backgroundColor: '#ECF0F1' 
  },
  modalButton: { 
    backgroundColor: '#27AE60', 
    padding: 14, 
    alignItems: 'center', 
    borderRadius: 8 
  },
  cancelButton: { 
    backgroundColor: '#E74C3C', 
    marginTop: 10 
  },
  modalButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});


export default ReviewPage;
