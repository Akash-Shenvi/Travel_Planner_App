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
  Dimensions,
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
    const pageResponse = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(restaurantName)}`
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
            srsearch:restaurantName,
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
      <ScrollView>
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
        await axios.post('http://192.168.27.138:5000/saveResturants', {
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
</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loader: { marginTop: '50%' },
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
    marginHorizontal: 10,
    color: '#9CA3AF', // Neutral gray icon
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
  },
  listContainer: { flex: 1, padding: 10,marginBottom: 50, },
  listItem: {  padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E3E9',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, },
  listItemText: {
    fontSize: 16,
    color: '#2C3A47',
    fontWeight: '500',
  },
  detailsContainer: { flex: 1, padding: 20 },
  photosContainer: {
  height: 250,
  marginBottom: 20,
  flexDirection: 'row',
  borderRadius: 10,
  overflow: 'hidden',
  },
  image: {
    width: Dimensions.get('window').width - 30,
    height: 250,
    borderRadius: 15,
    marginVertical: 15,
    alignSelf: 'center',
  },
   title: {
    fontSize: 22,
    fontWeight: '700',
    margin: 10,
    color: '#343A40',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    marginHorizontal: 10,
  },
  rating: {
  fontSize: 16,
  color: '#E91E63', // Pink rating color
  fontWeight: '600',
  marginBottom: 10,
},
  website: { fontSize: 16, marginBottom: 10, color: '#4CAF50', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  hoursText: { fontSize: 16, color: 'gray', marginTop: 5 },
  summary: { fontSize: 16, marginTop: 10 },
  backButton: {
  marginBottom: 10,
  alignSelf: 'flex-start',
  padding: 10,
  borderRadius: 8,
  backgroundColor: '#E9ECEF',
  marginTop:10,
},

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
  paddingVertical: 10, // Smaller padding for a compact look
  paddingHorizontal: 18,
  borderRadius: 100, // Slightly rounded corners for modern design
  flex: 1,
  marginVertical: 15, // Reduced vertical spacing
  marginHorizontal: 5, // Spacing between side-by-side buttons
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
  justifyContent:'center',
},
saveButtonText: {
  color: '#FFFFFF',
  fontSize: 16, // Adjusted for compact design
  fontWeight: '600', // Slightly lighter for a modern feel
  letterSpacing: 0.3,
  textAlign: 'center',
  alignContent:'center' // Subtle spacing for readability
},
navigateButton: {
  backgroundColor: '#007BFF',
  paddingVertical: 10, // Matches saveButton for uniformity
  paddingHorizontal: 18,
  borderRadius: 100,
  flex: 1,
  marginHorizontal: 5, // Keeps consistent spacing
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
  justifyContent:'center',
  marginBottom:5,
  
},
navigateButtonText: {
  color: '#FFFFFF',
  fontSize: 16, // Matches saveButtonText for uniformity
  fontWeight: '600',
  letterSpacing: 0.3,
  textAlign: 'center'
},
});
