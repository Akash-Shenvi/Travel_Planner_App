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

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
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
            types: '(cities)', // Restrict search to cities
            language: 'en',
          },
        });
        setSuggestions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
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
          fields: 'geometry', // Get city location details
        },
      });
      const location = response.data.result.geometry.location;
      setSelectedCity({ name: city.description, location });
      fetchNearbyAttractions(location);
    } catch (error) {
      console.error('Error fetching city details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyAttractions = async (location) => {
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: 5000, // Radius in meters
          type: 'tourist_attraction', // Attractions only
          key: GOOGLE_API_KEY,
        },
      });
      setNearbyAttractions(response.data.results);
    } catch (error) {
      console.error('Error fetching nearby attractions:', error);
    }
  };

  const handleSelectAttraction = async (attraction) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: attraction.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,rating,photos,types,opening_hours,website', // Attraction details
        },
      });
      const details = response.data.result;
      const photoRef = details.photos?.[0]?.photo_reference;
      const photoUrl = photoRef
        ? `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`
        : 'https://via.placeholder.com/400';
      setSelectedAttraction({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating,
        photoUrl,
        types: details.types || [],
        openingHours: details.opening_hours?.weekday_text || [],
        website: details.website || 'No website available',
      });
    } catch (error) {
      console.error('Error fetching attraction details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedAttraction) {
      setSelectedAttraction(null);
    } else if (selectedCity) {
      setSelectedCity(null);
      setNearbyAttractions([]);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : selectedAttraction ? (
          <View style={styles.detailsContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <Image source={{ uri: selectedAttraction.photoUrl }} style={styles.image} />
            <Text style={styles.title}>{selectedAttraction.name}</Text>
            <Text style={styles.subtitle}>{selectedAttraction.address}</Text>
            <Text style={styles.rating}>Rating: {selectedAttraction.rating || 'N/A'}</Text>
            <Text style={styles.website}>Website: {selectedAttraction.website}</Text>
            {selectedAttraction.openingHours.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Opening Hours:</Text>
                {selectedAttraction.openingHours.map((hour, index) => (
                  <Text key={index} style={styles.text}>
                    {hour}
                  </Text>
                ))}
              </>
            )}
          </View>
        ) : selectedCity ? (
          <View style={styles.nearbyContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.title}>Nearby Attractions in {selectedCity.name}</Text>
            <FlatList
              data={nearbyAttractions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => handleSelectAttraction(item)}
                >
                  <Text style={styles.listItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>Search Cities</Text>
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
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1 },
  header: { padding: 20, backgroundColor: '#4CAF50' },
  headerText: { fontSize: 20, color: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  listItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  listItemText: { fontSize: 16 },
  detailsContainer: { padding: 20 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  title: { fontSize: 24, marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'gray' },
  rating: { fontSize: 14, color: '#333', marginBottom: 10 },
  website: { fontSize: 14, color: '#0000EE', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 18, marginTop: 20 },
  text: { fontSize: 14, color: 'gray' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
  nearbyContainer: { padding: 20 },
});
