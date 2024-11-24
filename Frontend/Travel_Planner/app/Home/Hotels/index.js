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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';

const GOOGLE_API_KEY = 'AlzaSyhBE3HB6gaH5W13dDCCjCpkv24AfQD_lWW'; // Replace with your actual API key

export default function HotelSearchScreen() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) return;
      try {
        const response = await axios.get('https://maps.gomaps.pro/maps/api/place/autocomplete/json', {
          params: {
            input: query,
            key: GOOGLE_API_KEY,
            types: '(cities)', // Restrict to city suggestions
            language: 'en',
          },
        });
        setSuggestions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching city suggestions:', error);
      }
    };

    const debounceFetch = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceFetch);
  }, [query]);

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
      setHotels(response.data.results);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const handleSelectHotel = async (hotel) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: hotel.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,rating,photos,types,opening_hours,website,editorial_summary',
        },
      });
      const details = response.data.result;
      const photos = details.photos?.map((photo) => ({
        uri: `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`,
      }));
      setSelectedHotel({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating,
        photos: photos || [],
        types: details.types || [],
        website: details.website || 'No website available',
        summary: details.editorial_summary?.overview || 'No description available',
      });
    } catch (error) {
      console.error('Error fetching hotel details:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.website}>Website: {selectedHotel.website}</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: '50%' },
  header: { padding: 20, backgroundColor: '#4CAF50' },
  headerText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  searchContainer: { padding: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  listItemText: { fontSize: 16 },
  detailsContainer: { padding: 20 },
  photosContainer: { flexDirection: 'row', marginBottom: 10 },
  image: { width: 200, height: 150, borderRadius: 10, marginRight: 10 },
  title: { fontSize: 24, marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray' },
  rating: { fontSize: 14, color: '#333', marginVertical: 5 },
  website: { fontSize: 14, color: '#0000EE', textDecorationLine: 'underline' },
  summary: { fontSize: 16, marginVertical: 10 },
  backButton: { margin: 10 },
  listContainer: { padding: 20 },
});
