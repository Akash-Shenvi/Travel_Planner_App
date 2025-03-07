import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

const TripItinerary = () => {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch trip data from the backend
    const fetchTripData = async () => {
      try {
        const response = await axios.post('https://sunbeam-pet-octopus.ngrok-free.app/generate_trip');
        setTripData(response.data);
      } catch (err) {
        setError('Failed to load trip details. Please try again later.');
        console.error('Error fetching trip data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    Alert.alert('Error', error);
    return null;
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
    <ScrollView style={styles.container}>
      {/* Trip Details Section */}
      <View style={styles.section}>
        <Text style={styles.header}>Trip Details</Text>
        <Text style={styles.detail}>Destination: {trip_details.destination}</Text>
        <Text style={styles.detail}>Dates: {trip_details.dates}</Text>
        <Text style={styles.detail}>Budget: {trip_details.budget}</Text>
        <Text style={styles.detail}>Duration: {trip_details.duration}</Text>
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
          <Text key={index} style={styles.note}>
            • {note}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  daySection: {
    marginBottom: 20,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  activity: {
    marginBottom: 10,
  },
  activityDesc: {
    fontSize: 16,
    color: '#444',
  },
  activityDetail: {
    fontSize: 14,
    color: '#666',
  },
  activityNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
  },
  note: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
  },
});

export default TripItinerary;
