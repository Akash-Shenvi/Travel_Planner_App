import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const ReviewPage = () => {
  const params = useLocalSearchParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Review Page Params:', params);
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.57.138:5000/generate_trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.log('Trip Data:', data); // Log full data
      setTripData(data);
    } catch (err) {
      console.error('Error fetching trip data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Review Your Trip</Text>

      {/* Trip Details Section */}
      <View style={styles.section}>
        <Text style={styles.header}>Trip Details</Text>
        <Text style={styles.detail}>
          Destination: {trip_details?.destination || 'Not specified'}
        </Text>
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
                <Text style={styles.activityDetail}>
                  Estimated Cost: {activity.estimated_cost}
                </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
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
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default ReviewPage;
