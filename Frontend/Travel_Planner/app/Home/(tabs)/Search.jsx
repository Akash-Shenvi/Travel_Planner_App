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
  Dimensions,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useNavigation } from 'expo-router';
import { Linking } from 'react-native';

const GOOGLE_API_KEY = 'AlzaSyIc0rhqLEr8qYNwgzueZwh22QJZL7yQ-iH'; // Replace with your actual API key

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [nearbyAttractions, setNearbyAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [wikipediaDescription, setWikipediaDescription] = useState('');
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
          fields: 'geometry',
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
          radius: 5000,
          type: 'tourist_attraction',
          keyword: 'temple|beach', // Filter for temples and beaches
          key: GOOGLE_API_KEY,
        },
      });
      setNearbyAttractions(response.data.results);
    } catch (error) {
      console.error('Error fetching nearby attractions:', error);
    }
  };
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
const [selectedPhoto, setSelectedPhoto] = useState(null);

const openPhotoModal = (photo) => {
  setSelectedPhoto(photo);
  setPhotoModalVisible(true);
};

const closePhotoModal = () => {
  setPhotoModalVisible(false);
  setSelectedPhoto(null);
};

  const handleSelectAttraction = async (attraction) => {
    setLoading(true);
    try {
      const response = await axios.get('https://maps.gomaps.pro/maps/api/place/details/json', {
        params: {
          place_id: attraction.place_id,
          key: GOOGLE_API_KEY,
          fields: 'name,formatted_address,rating,photos,types,opening_hours,website',
        },
      });
      const details = response.data.result;
      const photos = details.photos?.map((photo) => {
        return `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`;
      });
      setSelectedAttraction({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating,
        photos: photos || ['https://via.placeholder.com/800'],
        types: details.types || [],
        openingHours: details.opening_hours?.weekday_text || [],
        website: details.website || 'No website available',
      });
      fetchWikipediaDescription(details.name); // Fetch description from Wikipedia
    } catch (error) {
      console.error('Error fetching attraction details:', error);
    } finally {
      setLoading(false);
    }
  };

const fetchWikipediaDescription = async (name) => {
  try {
    const pageResponse = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
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
            srsearch: name,
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


  const handleBack = () => {
    if (selectedAttraction) {
      setSelectedAttraction(null);
      setWikipediaDescription('');
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
            <ScrollView horizontal pagingEnabled>
              {selectedAttraction.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.image} />
              ))}
            </ScrollView>
            <Text style={styles.title}>{selectedAttraction.name}</Text>
            <Text style={styles.subtitle}>{selectedAttraction.address}</Text>
            <Text style={styles.rating}>Rating: {selectedAttraction.rating || 'N/A'}</Text>
            <Text style={styles.website}>Website: {selectedAttraction.website}</Text>
            <Text style={styles.sectionTitle}>Description:</Text>
            <Text style={styles.text}>{wikipediaDescription}</Text>
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
      
      {selectedAttraction && (
  <TouchableOpacity
    style={styles.saveButton}
    onPress={async () => {
      try {
        await axios.post('http://192.168.100.138:5000/saveAttraction', {
          name: selectedAttraction.name,
          location: selectedCity?.location || {},
          photo: selectedAttraction.photos[0],
          description: wikipediaDescription,
        });
        alert('Attraction saved successfully!');
      } catch (error) {
        console.error('Error saving attraction:', error);
        alert('Failed to save the attraction. Please try again.');
      }
    }}
  >
    <Text style={styles.saveButtonText}>Save</Text>
  </TouchableOpacity>
)}
{selectedAttraction && (
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
    backgroundColor: '#F4F5F9', // Soft neutral background
    paddingBottom: 50,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
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
    marginHorizontal: 10,
    color: '#9CA3AF', // Neutral gray icon
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
  },
  listItem: {
    padding: 15,
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
    elevation: 3,
  },
  listItemText: {
    fontSize: 16,
    color: '#2C3A47',
    fontWeight: '500',
  },
  backButton: {
    margin: 15,
    padding: 12,
    borderRadius: 15,
    backgroundColor: '#F4F5F9', // Subtle background for button
    borderColor: '#D6D8E1',
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
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
  text: {
    fontSize: 14,
    color: '#495057',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    color: '#5E60CE', // Matches the header theme
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  image: {
    width: Dimensions.get('window').width - 30,
    height: 250,
    borderRadius: 15,
    marginVertical: 15,
    alignSelf: 'center',
  },
  nearbyContainer: {
    flex: 1,
    padding: 10,
  },
  rating: {
    fontSize: 16,
    color: '#F5C518', // Gold color for ratings
    fontWeight: '600',
  },
  website: {
    fontSize: 16,
    color: '#007BFF', // Bright blue for links
    textDecorationLine: 'underline',
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
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between', // Align buttons with even spacing
  marginVertical: 10, // Balanced spacing around buttons
  marginHorizontal: 10,
  justifyContent:'center',
 
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
  
},
navigateButtonText: {
  color: '#FFFFFF',
  fontSize: 16, // Matches saveButtonText for uniformity
  fontWeight: '600',
  letterSpacing: 0.3,
  textAlign: 'center'
},



});
 