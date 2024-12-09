import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const ReviewPage = () => {
  const params = useLocalSearchParams();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTripData();
  }, []);

  const fetchTripData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.27.138:5000/generate_trip', {
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
      setTripData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
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
      {/* Trip Summary Section */}
      <View style={[styles.card, styles.shadow]}>
        <Text style={styles.title}>Trip Overview</Text>
        <Text style={styles.detail}>
          Destination: <Text style={styles.highlight}>{trip_details?.destination || 'N/A'}</Text>
        </Text>
        <Text style={styles.detail}>
          Dates: <Text style={styles.highlight}>{trip_details?.dates || 'N/A'}</Text>
        </Text>
        <Text style={styles.detail}>
          Budget: <Text style={styles.highlight}>{trip_details?.budget || 'N/A'}</Text>
        </Text>
        <Text style={styles.detail}>
          Duration: <Text style={styles.highlight}>{trip_details?.duration || 'N/A'} days</Text>
        </Text>
      </View>

      {/* Itinerary Section */}
      <View style={[styles.card, styles.shadow]}>
        <Text style={styles.title}>Itinerary</Text>
        {itinerary.map((day, index) => (
          <View key={index} style={styles.daySection}>
            <Text style={styles.dayHeader}>{day.day}</Text>
            {day.activities.map((activity, idx) => (
              <View key={idx} style={styles.activity}>
                <Text style={styles.activityDesc}>{activity.description}</Text>
                <Text style={styles.activityDetail}>Location: {activity.location}</Text>
                <Text style={styles.activityDetail}>Estimated Cost: {activity.estimated_cost}</Text>
                {activity.notes && (
                  <Text style={styles.activityNote}>Notes: {activity.notes}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Notes Section */}
      <View style={[styles.card, styles.shadow]}>
        <Text style={styles.title}>Important Notes</Text>
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
    backgroundColor: '#FFFBF2', // Warm, light beige for a welcoming background
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
  },
  card: {
    backgroundColor: '#FFFFFF', // Clean white cards
    borderRadius: 12,
    marginBottom: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFCC80', // Orange accent border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#FF5722', // Bright orange for title
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: '#3E2723', // Dark brown for contrast
    marginBottom: 8,
    lineHeight: 22,
  },
  highlight: {
    fontWeight: '700',
    color: '#8BC34A', // Bright green for highlights
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2', // Blue for day headers
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#BBDEFB', // Light blue accent
    paddingLeft: 10,
  },
  activity: {
    marginBottom: 16,
    paddingLeft: 12,
    backgroundColor: '#FFF8E1', // Soft yellow for activity blocks
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#FFE082', // Yellow accent border
  },
  activityDesc: {
    fontSize: 16,
    color: '#004D40', // Teal for activity descriptions
    fontWeight: '600',
  },
  activityDetail: {
    fontSize: 14,
    color: '#616161', // Neutral gray for secondary details
    marginTop: 4,
  },
  activityNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FF7043', // Orange for notes to match the theme
    marginTop: 6,
  },
  note: {
    fontSize: 14,
    color: '#7B1FA2', // Purple for notes
    marginBottom: 6,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#D1C4E9', // Light purple accent
  },
  errorText: {
    fontSize: 16,
    color: '#D50000', // Bright red for errors
    textAlign: 'center',
    fontWeight: '600',
  },
});


export default ReviewPage;
