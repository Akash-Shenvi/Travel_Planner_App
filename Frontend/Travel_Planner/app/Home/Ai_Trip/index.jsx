import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import { useNavigation, useRouter } from 'expo-router';


// Replace with your actual Google Places API key from gomaps.pro
const GOOGLE_API_KEY = 'AlzaSyK_RnNNH0BPrM4WAnfvh-zfqkjeBbZP27I';

export default function PlaceSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
     navigation.setOptions({
  headerTitle: 'Select a City',
  headerBackTitleVisible: false, // Removes the header text
  headerShown: true, // Ensures the header is displayed
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
      console.log('Selected Place Name:', place.description); // Print the place name to the console

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

      console.log('Place Details:', placeDetails); // Print detailed place info to the console

      // Navigate to the next page and pass data
      router.push({
        pathname: 'Home/Ai_Trip/SelectTraveller', // Replace with your target route
        params: {
          name: place.description, // Pass the place name
          location: JSON.stringify(placeDetails.geometry.location), // Pass the location details
        },
      });
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

      {/* Google branding */}
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
    backgroundColor: '#fff',
    
    
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
  padding: 12,
  fontSize: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd', // Subtle divider color
  backgroundColor: '#fff', // White background for contrast
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
