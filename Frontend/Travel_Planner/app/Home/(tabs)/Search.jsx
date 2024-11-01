import React, { useState, useEffect } from 'react';
import {
  View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image, ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';

const GOOGLE_API_KEY = 'AlzaSyhBE3HB6gaH5W13dDCCjCpkv24AfQD_lWW'; // Replace with your actual API key from gomaps.pro

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
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
            types: 'geocode',
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
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: place.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,geometry,photo,formatted_address',
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
      };

      setSelectedPlace(placeInfo);
      fetchNearbyPlaces(placeDetails.geometry.location);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  const fetchNearbyPlaces = async (location) => {
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/nearbysearch/json', {
        params: {
          location: `${location.lat},${location.lng}`,
          radius: 2000, // Radius in meters to search nearby places
          type: 'tourist_attraction', // You can adjust the type
          key: GOOGLE_API_KEY,
        },
      });
      setNearbyPlaces(response.data.results);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const handleClearSelection = () => {
    setSelectedPlace(null);
    setNearbyPlaces([]);
    setQuery('');
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

        {selectedPlace ? (
          <View style={styles.selectedPlaceContainer}>
            <TouchableOpacity onPress={handleClearSelection} style={styles.backIcon}>
              <FontAwesome name="arrow-left" size={24} color="gray" />
            </TouchableOpacity>
            <Image source={{ uri: selectedPlace.photoUrl }} style={styles.selectedPlaceImage} />
            <Text style={styles.selectedPlaceName}>{selectedPlace.name}</Text>
            <Text style={styles.selectedPlaceAddress}>{selectedPlace.address}</Text>

            <Text style={styles.nearbyTitle}>Nearby Attractions</Text>
            {nearbyPlaces.length > 0 ? (
              <FlatList
                data={nearbyPlaces}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <View style={styles.nearbyPlaceCard}>
                    <Text style={styles.nearbyPlaceName}>{item.name}</Text>
                    <Text style={styles.nearbyPlaceVicinity}>{item.vicinity}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noNearbyText}>No nearby attractions found</Text>
            )}
          </View>
        ) : (
          suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectPlace(item)} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{item.description}</Text>
                </TouchableOpacity>
              )}
            />
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1 },
  header: { paddingTop: 40, paddingHorizontal: 20 },
  headerText: { fontSize: 24, fontFamily: 'outfit-Bold' },
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
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: { fontSize: 16 },
  selectedPlaceContainer: { alignItems: 'center', marginVertical: 20 },
  backIcon: { position: 'absolute', top: 10, left: 10, zIndex: 1 },
  selectedPlaceImage: { width: '100%', height: 200, marginBottom: 10 },
  selectedPlaceName: { fontSize: 24, fontFamily: 'outfit-Bold' },
  selectedPlaceAddress: { fontSize: 16, color: 'gray',fontFamily: 'outfit' },
  nearbyTitle: { fontSize: 18, fontFamily: 'outfit-Bold', marginTop: 20, marginBottom: 10 },
  nearbyPlaceCard: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  nearbyPlaceName: { fontSize: 16, fontFamily: 'outfit-Bold' },
  nearbyPlaceVicinity: { fontSize: 14, color: 'gray',fontFamily: 'outfit' },
  noNearbyText: { textAlign: 'center', color: 'gray', marginTop: 20,fontFamily: 'outfit' },
});
