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
  Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const GOOGLE_API_KEY = 'AlzaSyIc0rhqLEr8qYNwgzueZwh22QJZL7yQ-iH'; // Replace with your actual API key

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
    const pageResponse = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hotelName)}`
    );

    if (pageResponse.data.extract) {
      return pageResponse.data.extract;
    } else {
      throw new Error('Summary not found, fallback to search.');
    }
  } catch (error) {
    console.warn('Direct summary fetch failed. Attempting search...');

    // Fallback: Search Wikipedia
    try {
      const searchResponse = await axios.get(
        `https://en.wikipedia.org/w/api.php`,
        {
          params: {
            action: 'query',
            list: 'search',
            srsearch: hotelName,
            format: 'json',
            origin: '*', // Required for CORS
          },
        }
      );

      const firstResult = searchResponse.data.query?.search?.[0];
      if (firstResult) {
        return `Search Result: ${firstResult.snippet.replace(/(<([^>]+)>)/gi, '')}...`;
      } else {
        return 'No description found in search results.';
      }
    } catch (searchError) {
      console.error('Error during Wikipedia search:', searchError);
      return 'No description available.';
    }
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
      <ScrollView>
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
     {selectedHotel && (
  <TouchableOpacity
    style={styles.saveButton}
    onPress={async () => {
      try {
        const response = await axios.post('http://192.168.27.138:5000/saveHotels', {
          name: selectedHotel.name,
          location: selectedCity?.location || {}, // Ensure the location is passed correctly
          photo: selectedHotel.photos[0]?.uri || '', // Handle cases where photos might be unavailable
          description: selectedHotel.summary || 'No description available', // Use the summary for description
        });
        if (response.status === 201) {
          alert('Hotel saved successfully!');
        } else {
          alert('Failed to save the hotel. Please try again.');
        }
      } catch (error) {
        console.error('Error saving hotel:', error);
        alert('An error occurred while saving the hotel. Please try again later.');
      }
    }}
  >
    <Text style={styles.saveButtonText}>Save Hotel</Text>
  </TouchableOpacity>
)}
{selectedHotel && (
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
</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: '#f8f9fa', // Light, neutral background for a modern look
},
loader: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom:30
},
header: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#5E60CE', // Modern deep blue-purple header
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerText: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6D8E1',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },


icon: {
  marginRight: 10,
  color: '#6C757D', // Subtle icon color
},
input: {
  flex: 1,
  borderWidth: 0,
  fontSize: 16,
  color: '#343A40',
},
listContainer: {
  flex: 1,
  padding: 20,
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
  elevation: 5,
   // Shadow for Android
},
listItem: {
  padding: 15,
  marginVertical: 8,
  backgroundColor: '#fff',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#ddd',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2, // Shadow for Android
  
},
listItemText: {
  fontSize: 16,
  color: '#343A40',
  fontWeight: '600',
  
},
detailsContainer: {
  flex: 1,
  padding: 20,
  backgroundColor: '#fff',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
},
photosContainer: {
  height: 250,
  marginBottom: 20,
  flexDirection: 'row',
  borderRadius: 10,
  overflow: 'hidden',
  
},
image: {
  width: Dimensions.get('window').width - 40,
  height: 250,
  borderRadius: 10,
  marginHorizontal: 5,
  resizeMode: 'cover',
},
title: {
  fontSize: 22,
  fontWeight: 'bold',
  marginTop: 20,
  color: '#343A40',
  
},
subtitle: {
  fontSize: 16,
  color: '#6C757D',
  marginVertical: 5,
 
},
rating: {
  fontSize: 16,
  color: '#E91E63', // Pink rating color
  fontWeight: '600',
  marginBottom: 10,
},
website: {
  fontSize: 16,
  color: '#007bff', // Blue link color
  textDecorationLine: 'underline',
  marginBottom: 10,
},
summary: {
  fontSize: 16,
  color: '#6C757D',
  lineHeight: 22,
  marginTop: 10,
  
},
backButton: {
  marginBottom: 10,
  alignSelf: 'flex-start',
  padding: 10,
  borderRadius: 8,
  backgroundColor: '#E9ECEF',
  marginTop:10,
},
saveButton: {
  backgroundColor: '#4CAF50',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'center',
  marginTop: 20,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
},
saveButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 20,
  paddingHorizontal: 20,
},
navigateButton: {
  backgroundColor: '#007bff', // Blue button
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 10,
  alignSelf: 'center',
  marginTop: 20,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
   marginBottom:100,
},
navigateButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},


});
