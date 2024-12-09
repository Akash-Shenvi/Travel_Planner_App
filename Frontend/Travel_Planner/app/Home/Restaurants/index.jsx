import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const GOOGLE_API_KEY = 'AlzaSyIc0rhqLEr8qYNwgzueZwh22QJZL7yQ-iH'; // Replace with your actual API key

export default function RestaurantSearchScreen() {
  // State Hooks
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // Effect Hook to hide the header on mount
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Effect Hook to fetch city suggestions
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await axios.get('https://maps.gomaps.pro/maps/api/place/autocomplete/json', {
          params: {
            input: query,
            key: GOOGLE_API_KEY,
            types: '(cities)', // Restrict to city suggestions
            language: 'en',
          },
        });
        setSuggestions(response.data.predictions || []);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
      }
    };

    const debounceFetch = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceFetch); // Cleanup
  }, [query]);

  // Fetch restaurants for the selected city
  const handleSelectCity = async (city) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: city.place_id,
          key: GOOGLE_API_KEY,
          fields: 'geometry',
        },
      });
      const location = response.data.result.geometry.location;
      setSelectedCity({ name: city.description, location });
      fetchRestaurants(location);
    } catch (error) {
      console.error('Error fetching city details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby restaurants
  const fetchRestaurants = async (location) => {
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: 5000, // Radius in meters
          type: 'restaurant', // Search for restaurants
          key: GOOGLE_API_KEY,
        },
      });
      setRestaurants(response.data.results || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Fetch Wikipedia summary for a restaurant
  const fetchWikipediaSummary = async (restaurantName) => {
    try {
      const response = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(restaurantName)}`
      );
      return response.data.extract || 'No description available on Wikipedia.';
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      return 'No description available on Wikipedia.';
    }
  };

  // Fetch restaurant details when selected
  const handleSelectRestaurant = async (restaurant) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: restaurant.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,rating,photos,types,website,opening_hours',
        },
      });
      const details = response.data.result;
      const photos = details.photos?.map((photo) => ({
        uri: `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`,
      }));
      const summary = await fetchWikipediaSummary(details.name);

      setSelectedRestaurant({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating,
        photos: photos || [],
        types: details.types || [],
        website: details.website || 'No website available',
        openingHours: details.opening_hours?.weekday_text || [],
        summary,
      });
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate back
  const handleBack = () => {
    if (selectedRestaurant) {
      setSelectedRestaurant(null);
    } else if (selectedCity) {
      setSelectedCity(null);
      setRestaurants([]);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  };

  // Open website
  const openWebsite = (url) => {
    if (url !== 'No website available') {
      Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
    }
  };

  // Render UI
  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF5722" style={styles.loader} />
      ) : selectedRestaurant ? (
        <View style={styles.detailsContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#FF5722" />
          </TouchableOpacity>
          <ScrollView horizontal style={styles.photosContainer}>
            {selectedRestaurant.photos.map((photo, index) => (
              <Image key={index} source={photo} style={styles.image} />
            ))}
          </ScrollView>
          <Text style={styles.title}>{selectedRestaurant.name}</Text>
          <Text style={styles.subtitle}>{selectedRestaurant.address}</Text>
          <Text style={styles.rating}>Rating: {selectedRestaurant.rating || 'N/A'}</Text>
          <TouchableOpacity onPress={() => openWebsite(selectedRestaurant.website)}>
            <Text style={styles.website}>Website: {selectedRestaurant.website}</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Opening Hours:</Text>
          {selectedRestaurant.openingHours.map((hours, index) => (
            <Text key={index} style={styles.hoursText}>
              {hours}
            </Text>
          ))}
          <Text style={styles.sectionTitle}>About:</Text>
          <Text style={styles.summary}>{selectedRestaurant.summary}</Text>
        </View>
      ) : selectedCity ? (
        <View style={styles.listContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#FF5722" />
          </TouchableOpacity>
          <Text style={styles.title}>Restaurants in {selectedCity.name}</Text>
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelectRestaurant(item)}
              >
                <Text style={styles.listItemText}>{item.name}</Text>
                <Text style={styles.rating}>Rating: {item.rating || 'N/A'}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Search Restaurants</Text>
          </View>
          <View style={styles.searchBox}>
            <FontAwesome name="search" size={20} color="gray" style={styles.icon} />
            <TextInput
              placeholder="Enter city name"
              style={styles.input}
              value={query}
              onChangeText={setQuery}
            />
          </View>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelectCity(item)}
              >
                <Text style={styles.listItemText}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      {selectedRestaurant && (
  <TouchableOpacity
    style={styles.saveButton}
    onPress={async () => {
      try {
        await axios.post('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/saveResturants', {
          name: selectedRestaurant.name,
          location: selectedCity?.location || {}, // Fallback to an empty object if no location
          photo: selectedRestaurant.photos.length > 0 ? selectedRestaurant.photos[0].uri : 'No photo available',
          description: selectedRestaurant.summary || 'No description available',
        });
        alert('Restaurant saved successfully!');
      } catch (error) {
        console.error('Error saving restaurant:', error);
        alert('Failed to save the restaurant. Please try again.');
      }
    }}
  >
    <Text style={styles.saveButtonText}>Save</Text>
  </TouchableOpacity>
)}
{selectedRestaurant && (
<TouchableOpacity
      style={styles.navigateButton}
      onPress={() => {
        const { lat, lng } = selectedCity?.location || {};
        if (lat && lng) {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
          Linking.openURL(url);
        } else {
          alert('Location information not available.');
        }
      }}
    >
      <Text style={styles.navigateButtonText}>Navigate</Text>
    </TouchableOpacity>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: '50%' },
  header: { padding: 20, backgroundColor: '#8A4DEB', padding:25, alignItems:'center', },
  headerText: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  searchContainer: {  },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', marginLeft: 10 },
  icon: { marginLeft: 10 },
  listContainer: { flex: 1, padding: 20,marginBottom: 50, },
  listItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  listItemText: { fontSize: 16 },
  detailsContainer: { flex: 1, padding: 20 },
  photosContainer: { height: 200, marginBottom: 10 },
  image: { width: 300, height: 200, marginRight: 10, borderRadius: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, marginBottom: 10, color: 'gray' },
  rating: { fontSize: 16, marginBottom: 10 },
  website: { fontSize: 16, marginBottom: 10, color: '#4CAF50', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  hoursText: { fontSize: 16, color: 'gray', marginTop: 5 },
  summary: { fontSize: 16, marginTop: 10 },
  backButton: { marginBottom: 20, marginTop: 17, },

    searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e9ecef', // Subtle gray
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // Shadow for Android
  },
  saveButton: {
  backgroundColor: '#4CAF50',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignSelf: 'center',
  marginVertical: 20,
},
saveButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
navigateButton: {
  backgroundColor: '#007bff', // Blue color for the navigate button
  paddingVertical: 12,
  paddingHorizontal: 20,
  marginBottom: 30,
  borderRadius: 8,
  alignSelf: 'center',
},
navigateButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
});
