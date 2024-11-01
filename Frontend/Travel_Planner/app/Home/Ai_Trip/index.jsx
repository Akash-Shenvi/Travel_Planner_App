import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from 'expo-router';

// Replace with your actual Google Places API key from gomaps.pro
const GOOGLE_API_KEY = 'AlzaSyhBE3HB6gaH5W13dDCCjCpkv24AfQD_lWW';

export default function PlaceSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    const fetchSuggestions = async () => {
      if (query.length < 3) return; // Start searching after 3 characters
      try {
        const response = await axios.get(
          'https://maps.gomaps.pro/maps/api/place/autocomplete/json',
          {
            params: {
              input: query,
              key: GOOGLE_API_KEY,
              types: 'geocode', // Broad search including cities and addresses
              language: 'en', // Set language if needed
            },
          }
        );
        if (response.data.predictions) {
          setSuggestions(response.data.predictions);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceFetch = setTimeout(fetchSuggestions, 300); // 300ms debounce
    return () => clearTimeout(debounceFetch);
  }, [query]);

  const handleSelectPlace = async (place) => {
    try {
      const response = await axios.get(
        'https://maps.gomaps.pro/maps/api/place/details/json',
        {
          params: {
            place_id: place.place_id,
            key: GOOGLE_API_KEY,
            fields: 'name,geometry', // Specify the fields you want to retrieve
          },
        }
      );

      const placeDetails = response.data.result;
      console.log('Selected Place:', place.description);
      console.log('Place Details:', placeDetails);
      console.log('Place Details:', placeDetails.geometry.location);
      console.log('Place Details:', placeDetails.url);


      // Set the query to selected place name and clear suggestions
      setQuery(place.description);
      setSuggestions([]);
      
      // Use placeDetails as needed, for example, navigate with details
      // router.push('/destination', { coordinates: placeDetails.geometry.location });
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search for places"
        value={query}
        onChangeText={setQuery}
      />

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectPlace(item)}>
              <Text style={styles.suggestionText}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Google branding as in your example */}
      <View style={styles.poweredByGoogleContainer}>
        <Image
          source={{
            uri: 'https://developers.google.com/maps/documentation/images/powered_by_google_on_white.png',
          }}
          style={styles.poweredByGoogleImage}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  searchInput: {
    height: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  suggestionText: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  poweredByGoogleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  poweredByGoogleImage: {
    width: 120,
    height: 20,
  },
});
