import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRouter } from 'expo-router';
const UserPlacesScreen = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Fetch user places and check if visited
  const fetchPlaces = async () => {
    try {
      const response = await axios.get('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/get_user_places', {
        withCredentials: true,
      });
      const rawPlaces = response.data.places;

      const processedPlaces = await Promise.all(
        rawPlaces.map(async ([place_id, place_name, place_description, place_photo_url, place_type, visited]) => {
          // Check if the place is visited
          const visitedResponse = await checkIfVisited(place_id, place_type);
          return {
            place_id,
            place_name,
            place_description,
            place_photo_url,
            place_type,
            visited: visitedResponse.visited,
          };
        })
      );

      setPlaces(processedPlaces);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch places.');
    } finally {
      setLoading(false);
    }
  };

  // Check if the place is visited by calling the backend
  const checkIfVisited = async (place_id, place_type) => {
    try {
      const response = await axios.get('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/check_place_visited', {
        params: { place_id, place_type },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      
      return { visited: false }; // Default to false if there's an error
    }
  };

  // Mark a place as visited
  const markAsVisited = async (place_id, place_type) => {
    try {
      const response = await axios.post(
        'https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/mark_as_visited',
        { place_id, place_type },
        { withCredentials: true }
      );
      Alert.alert('Success', response.data.message);
      fetchPlaces(); // Refresh the list after marking as visited
    } catch (error) {
      Alert.alert('Error', 'Failed to mark the place as visited.');
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // Delete a specific place
  const deletePlace = async (place_id, place_type) => {
    try {
      const response = await axios.delete('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/delete_place', {
        data: { place_id, place_type },
        withCredentials: true,
      });
      Alert.alert('Success', response.data.message);
      fetchPlaces(); // Refresh the list after deletion
    } catch (error) {
      Alert.alert('Error', 'Failed to delete the place.');
    }
  };

  // Delete all places
  const deleteAllPlaces = async () => {
    try {
      const response = await axios.delete('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/delete_all_places', {
        withCredentials: true,
      });
      Alert.alert('Success', response.data.message);
      fetchPlaces(); // Refresh the list after deletion
    } catch (error) {
      Alert.alert('Error', 'Failed to delete all places.');
    }
  };

  // Fetch latitude and longitude from the backend
  const getPlaceCoordinates = async (place_id) => {
    try {
      const response = await axios.get(
        `https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/get_user_places_locations?place_id=${place_id}`,
        { withCredentials: true }
      );

      const { location } = response.data;
      if (location) {
        const { latitude, longitude } = location;
        return { latitude, longitude };
      } else {
        Alert.alert('Error', 'Place coordinates not found.');
        return null;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch coordinates for the place.');
      return null;
    }
  };

  // Navigate to place location
  const navigateToPlace = async (place_id) => {
    const coordinates = await getPlaceCoordinates(place_id);
    if (coordinates) {
      const { latitude, longitude } = coordinates;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Failed to open maps.');
      });
    }
  };

  // Render each place
  const renderPlace = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.place_photo_url }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{item.place_name}</Text>
        <Text style={styles.placeDescription} numberOfLines={2}>
          {item.place_description}
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deletePlace(item.place_id, item.place_type)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => navigateToPlace(item.place_id)}
          >
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </TouchableOpacity>
          {!item.visited && (
            <TouchableOpacity
              style={styles.visitedButton}
              onPress={() => markAsVisited(item.place_id, item.place_type)}
            >
              <Text style={styles.visitedButtonText}>Mark as Visited</Text>
            </TouchableOpacity>
          )}
          {item.visited && <Text style={styles.visitedLabel}>Done</Text>}
        </View>
      </View>
    </View>
  );

  // Filter places by type
  const getPlacesByType = (type) => places.filter((place) => place.place_type === type);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your One day trip</Text>

      {['hotel', 'restaurant', 'attraction'].map((type) => {
        const typePlaces = getPlacesByType(type);
        if (typePlaces.length === 0) return null;

        return (
          <View key={type} style={styles.section}>
            <Text style={styles.sectionHeader}>
              {type === 'hotel' ? 'Hotels' : type === 'restaurant' ? 'Restaurants' : 'Attractions'}
            </Text>
            <FlatList
              data={typePlaces}
              keyExtractor={(item) => `${item.place_id}-${item.place_type}`}
              renderItem={renderPlace}
              contentContainerStyle={styles.listContent}
            />
          </View>
        );
      })}

      {places.length > 0 && (
        <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAllPlaces}>
          <Text style={styles.deleteAllButtonText}>Delete All Places</Text>
        </TouchableOpacity>
      )}

      {places.length === 0 && <Text style={styles.noPlacesText}>No saved places found.</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  placeDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  navigateButton: {
    backgroundColor: '#3498db',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  visitedButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  visitedButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  visitedLabel: {
    fontSize: 14,
    color: '#27ae60',
  },
  deleteAllButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPlacesText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserPlacesScreen;
