import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Your Saved AI Trips',
    });
    
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.100.138:5000/get_trips');
      if (!response.ok) {
        throw new Error('Failed to fetch trips.');
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format.');
      }

      setTrips(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while fetching trips.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    try {
      const response = await fetch(`http://192.168.100.138:5000/delete_ai_trip`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trip_id: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip.');
      }

      const data = await response.json();

      if (data.success) {
        setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== id));
        Alert.alert('Success', 'Trip deleted successfully.');
      } else {
        throw new Error(data.message || 'Failed to delete trip.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while deleting the trip.');
    }
  };

  const deleteAllTrips = async () => {
    try {
      const response = await fetch(`http://192.168.100.138:5000/delete_all_trips`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete all trips.');
      }

      const data = await response.json();

      if (data.success) {
        setTrips([]); // Clear the trips list
        Alert.alert('Success', 'All trips deleted successfully.');
      } else {
        throw new Error(data.message || 'Failed to delete all trips.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while deleting all trips.');
    }
  };

  const fetchTripDetails = async (id) => {
    if (!id) {
      Alert.alert('Error', 'Trip ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.100.138:5000/get_trip_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trip_id: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trip details.');
      }

      const data = await response.json();

      if (!data || !data.trip_name) {
        throw new Error('Invalid trip details received.');
      }

      const tripData = typeof data.trip_data === 'string' ? JSON.parse(data.trip_data) : data.trip_data;

      setSelectedTrip({
        ...data,
        trip_data: tripData,
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred while fetching trip details.');
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

  if (selectedTrip) {
    const { trip_name, trip_data } = selectedTrip;

    return (
      <ScrollView style={styles.container}>
        <View style={styles.detailsContainer}>
          {/* Trip Details */}
          <Text style={styles.detailsTitle}>Trip Details</Text>
          <View style={styles.infoSection}>
            <Text style={styles.detail}>
              <Text style={styles.subHeading}>Name: </Text>
              {trip_name}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.subHeading}>Destination: </Text>
              {trip_data.trip_details.destination || 'N/A'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.subHeading}>Dates: </Text>
              {trip_data.trip_details.dates || 'N/A'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.subHeading}>Budget: </Text>
              {trip_data.trip_details.budget || 'N/A'}
            </Text>
          </View>

          {/* Itinerary */}
          <Text style={styles.sectionTitle}>Itinerary</Text>
          {trip_data.itinerary.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day.day}</Text>
              {day.activities.map((activity, idx) => (
                <View key={idx} style={styles.activityContainer}>
                  <Text style={styles.activityText}>
                    <Text style={styles.subHeading1}>Location: </Text>
                    {activity.location}
                  </Text>
                  <Text style={styles.activityText}>
                    <Text style={styles.subHeading4}>Description: </Text>
                    {activity.description}
                  </Text>
                  <Text style={styles.activityText}>
                    <Text style={styles.subHeading3}>Estimated Cost: </Text>
                    {activity.estimated_cost}
                  </Text>
                  {activity.notes && (
                    <Text style={styles.activityNote}>
                      <Text style={styles.subHeading}>Notes: </Text>
                      {activity.notes}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTrip(null)}>
            <Text style={styles.backButtonText}>Back to Trips</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noTripsText}>No saved trips found.</Text>
        <TouchableOpacity style={styles.buildTripButton} onPress={() => router.push('/Home/Ai_Trip')}>
          <Text style={styles.buildTripButtonText}>Build Trip with AI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.tripItemContainer}>
            <TouchableOpacity
              style={styles.tripItem}
              onPress={() => fetchTripDetails(item.id)}
            >
              <Text style={styles.tripText}>
                {index + 1}. {item.trip_name}
              </Text>
            </TouchableOpacity>

            {/* Delete Icon */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTrip(item.id)}
            >
              <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#F9FAFC', // Subtle off-white for a light feel
    paddingHorizontal: 16, // Add padding to avoid overlapping with edges
    paddingVertical: 20, // Top and bottom padding for better spacing
  },
  noTripsText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  buildTripButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buildTripButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    alignItems:'center'
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  detailsTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FF6F61', // Coral for an inviting look
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  infoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF9E5', // Light yellow for distinction
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  detail: {
    fontSize: 16,
    color: '#37474F',
    lineHeight: 22,
    marginBottom: 8,
  },
  subHeading: {
    fontWeight: 'bold',
    color: '#42A5F5',
    fontSize: 18, // Cool blue for subheadings
  },
  subHeading1: {
    fontWeight: 'bold',
    color: '#5A67D8',
    fontSize: 18,
  },
  subHeading3: {
    fontWeight: 'bold',
    color: '#8BC34A',
    fontSize: 18,
  },
  subHeading4: {
    fontWeight: 'bold',
    color: '#3E2723',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF7043', // Vibrant orange for sections
    marginBottom: 16,
  },
  dayContainer: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5', // Bright blue for day titles
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#BBDEFB',
    paddingLeft: 10,
  },
  activityContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activityText: {
    fontSize: 16,
    color: '#37474F',
    lineHeight: 22,
  },
  deleteButton: {
    padding: 8,
  },
  activityNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#FF7043', // Orange for notes
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#00796B', // Teal for a fresh, professional look
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  tripItemContainer: {
    flexDirection: 'row', // Arrange items in a row
    justifyContent: 'space-between', // Space between text and icon
    alignItems: 'center', // Align items vertically in the center
    padding: 16,
    backgroundColor: '#FFFFFF', // Match trip item background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCC80',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  tripText: {
    fontSize: 18,
    color: '#3E2723',
    fontWeight: 'bold',
  },
  deleteIconContainer: {
    backgroundColor: '#FFCDD2', // Light red for delete button background
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIcon: {
    fontSize: 18,
    color: '#D32F2F', // Red color for the delete icon
  },


});

export default TripList;
