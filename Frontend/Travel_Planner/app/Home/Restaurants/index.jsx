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

const GOOGLE_API_KEY = 'AlzaSyhBE3HB6gaH5W13dDCCjCpkv24AfQD_lWW'; // Replace with your actual API key

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: '50%' },
  header: { padding: 20, backgroundColor: '#FF5722' },
  headerText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  searchContainer: { padding: 20 },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  input: { flex: 1, borderBottomWidth: 1, borderBottomColor: 'gray', marginLeft: 10 },
  icon: { marginLeft: 10 },
  listContainer: { flex: 1, padding: 20 },
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
  backButton: { marginBottom: 20 },
});
