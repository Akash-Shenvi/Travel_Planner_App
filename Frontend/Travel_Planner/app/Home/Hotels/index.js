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

export default function HotelSearchScreen() {
  // State Hooks
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
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
    return () => clearTimeout(debounceFetch); // Cleanup to avoid race conditions
  }, [query]);

  // Fetch hotels for the selected city
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
      fetchHotels(location);
    } catch (error) {
      console.error('Error fetching city details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby hotels
  const fetchHotels = async (location) => {
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: 5000, // Radius in meters
          type: 'lodging', // Search for hotels
          key: GOOGLE_API_KEY,
        },
      });
      setHotels(response.data.results || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  // Fetch Wikipedia summary for a hotel
  const fetchWikipediaSummary = async (hotelName) => {
    try {
      const response = await axios.get(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hotelName)}`
      );
      return response.data.extract || 'No description available on Wikipedia.';
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      return 'No description available on Wikipedia.';
    }
  };

  // Fetch hotel details when selected
  const handleSelectHotel = async (hotel) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: hotel.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,rating,photos,types,website',
        },
      });
      const details = response.data.result;
      const photos = details.photos?.map((photo) => ({
        uri: `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`,
      }));
      const summary = await fetchWikipediaSummary(details.name);

      setSelectedHotel({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating,
        photos: photos || [],
        types: details.types || [],
        website: details.website || 'No website available',
        summary,
      });
    } catch (error) {
      console.error('Error fetching hotel details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate back
  const handleBack = () => {
    if (selectedHotel) {
      setSelectedHotel(null);
    } else if (selectedCity) {
      setSelectedCity(null);
      setHotels([]);
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
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : selectedHotel ? (
        <View style={styles.detailsContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <ScrollView horizontal style={styles.photosContainer}>
            {selectedHotel.photos.map((photo, index) => (
              <Image key={index} source={photo} style={styles.image} />
            ))}
          </ScrollView>
          <Text style={styles.title}>{selectedHotel.name}</Text>
          <Text style={styles.subtitle}>{selectedHotel.address}</Text>
          <Text style={styles.rating}>Rating: {selectedHotel.rating || 'N/A'}</Text>
          <TouchableOpacity onPress={() => openWebsite(selectedHotel.website)}>
            <Text style={styles.website}>Website: {selectedHotel.website}</Text>
          </TouchableOpacity>
          <Text style={styles.summary}>{selectedHotel.summary}</Text>
        </View>
      ) : selectedCity ? (
        <View style={styles.listContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.title}>Hotels in {selectedCity.name}</Text>
          <FlatList
            data={hotels}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelectHotel(item)}
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
            <Text style={styles.headerText}>Search Hotels</Text>
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
  container: {
    marginBottom: 50,
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background
  },
  loader: { marginTop: '50%' },
   header: {
    padding: 20,
    backgroundColor: '#8A4DEB', // Green header
    alignItems: 'center',
  },
  headerText: { fontSize: 26, color: '#fff', fontWeight: 'bold' },
  searchContainer: { },
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
  summary: { fontSize: 16, marginTop: 10 },
  backButton: { marginBottom: 20 },

    searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
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
});
