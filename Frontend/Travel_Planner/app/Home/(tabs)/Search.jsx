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
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [placeDetails, setPlaceDetails] = useState(null);
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
            types: 'establishment', // Specify types of places
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

  const handleSelectPlace = async (place) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: place.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,geometry,photos,formatted_address,rating,reviews,opening_hours,website,types', // Add more fields for detailed info
        },
      });

      const placeDetails = response.data.result;
      const photoRef = placeDetails.photos?.[0]?.photo_reference;
      const photoUrl = photoRef
        ? `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`
        : 'https://via.placeholder.com/400';

      const placeInfo = {
        id: place.place_id,
        name: placeDetails.name,
        address: placeDetails.formatted_address || 'No address available',
        photoUrl,
        rating: placeDetails.rating,
        reviews: placeDetails.reviews || [],
        openingHours: placeDetails.opening_hours?.weekday_text || [],
        website: placeDetails.website || 'No website available',
        types: placeDetails.types || [],
      };

      setSelectedPlace(placeInfo);
      fetchNearbyPlaces(placeDetails.geometry.location);
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyPlaces = async (location) => {
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: 2000, // Radius in meters to search nearby places
          type: 'tourist_attraction', // Specify place types
          key: GOOGLE_API_KEY,
        },
      });
      setNearbyPlaces(response.data.results);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const showPlaceDetails = async (place) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: place.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,rating,photos,description', // Add description field
        },
      });

      const details = response.data.result;
      const photoRef = details.photos?.[0]?.photo_reference;
      const photoUrl = photoRef
        ? `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_API_KEY}`
        : 'https://via.placeholder.com/400';

      setPlaceDetails({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating,
        photoUrl,
        description: details.description || 'No description available.',
      });
    } catch (error) {
      console.error('Error fetching detailed place information:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Search</Text>
        </View>

        <View style={styles.searchBox}>
          <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput
            placeholder="Where to?"
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#ff0000" />
        ) : selectedPlace ? (
          <View style={styles.selectedPlaceContainer}>
            <Image source={{ uri: selectedPlace.photoUrl }} style={styles.selectedPlaceImage} />
            <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
            <Text style={styles.selectedPlaceAddress}>{selectedPlace.address}</Text>
            <Text style={styles.selectedPlaceRating}>Rating: {selectedPlace.rating}</Text>

            <Text style={styles.selectedPlaceWebsite}>
              Website: {selectedPlace.website || 'No website available'}
            </Text>
            <Text style={styles.selectedPlaceTypes}>
              Types: {selectedPlace.types.join(', ') || 'No types available'}
            </Text>

            {selectedPlace.openingHours.length > 0 && (
              <>
                <Text style={styles.openingHoursTitle}>Opening Hours:</Text>
                {selectedPlace.openingHours.map((hour, index) => (
                  <Text key={index} style={styles.openingHoursText}>
                    {hour}
                  </Text>
                ))}
              </>
            )}

            <Text style={styles.nearbyTitle}>Nearby Attractions</Text>
            <FlatList
              data={nearbyPlaces}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => showPlaceDetails(item)} style={styles.nearbyPlaceCard}>
                  <Text style={styles.nearbyPlaceName}>{item.name}</Text>
                  <Text style={styles.nearbyPlaceVicinity}>{item.vicinity}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectPlace(item)} style={styles.suggestionItem}>
                <Text style={styles.suggestionText}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {placeDetails && (
          <View style={styles.placeDetailsContainer}>
            <Image source={{ uri: placeDetails.photoUrl }} style={styles.placeDetailImage} />
            <Text style={styles.placeDetailName}>{placeDetails.name}</Text>
            <Text style={styles.placeDetailRating}>Rating: {placeDetails.rating}</Text>
            <Text style={styles.placeDetailAddress}>{placeDetails.address}</Text>
            <Text style={styles.placeDetailDescription}>{placeDetails.description}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1 },
  header: { paddingTop: 40, paddingHorizontal: 20, backgroundColor: '#4CAF50', paddingBottom: 20 },
  headerText: { fontSize: 24, fontFamily: 'outfit-Bold', color: '#fff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  selectedPlaceContainer: { alignItems: 'center', marginVertical: 20 },
  selectedPlaceImage: { width: '100%', height: 200, marginBottom: 10, borderRadius: 10 },
  selectedPlaceName: { fontSize: 24, fontFamily: 'outfit-Bold', color: '#333' },
  selectedPlaceAddress: { fontSize: 16, color: 'gray', marginBottom: 10 },
  selectedPlaceRating: { fontSize: 16, color: 'gray' },
  selectedPlaceWebsite: { fontSize: 14, marginTop: 10, color: '#0000EE', textDecorationLine: 'underline' },
  selectedPlaceTypes: { fontSize: 14, color: 'gray' },
  openingHoursTitle: { fontSize: 16, fontFamily: 'outfit-Bold', color: '#4CAF50', marginTop: 10 },
  openingHoursText: { fontSize: 14, color: '#555' },
  nearbyTitle: { fontSize: 18, marginTop: 20, marginBottom: 10, color: '#4CAF50' },
  nearbyPlaceCard: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    marginVertical: 5,
  },
  nearbyPlaceName: { fontSize: 16, fontFamily: 'outfit-Bold' },
  nearbyPlaceVicinity: { fontSize: 14, color: 'gray' },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
  },
  suggestionText: { fontSize: 16 },
  placeDetailsContainer: { padding: 20, backgroundColor: '#fff' },
  placeDetailImage: { width: '100%', height: 200, borderRadius: 10 },
  placeDetailName: { fontSize: 24, fontFamily: 'outfit-Bold', marginVertical: 10 },
  placeDetailRating: { fontSize: 16, color: 'gray' },
  placeDetailAddress: { fontSize: 16 },
  placeDetailDescription: { fontSize: 14, marginVertical: 10 },
});
