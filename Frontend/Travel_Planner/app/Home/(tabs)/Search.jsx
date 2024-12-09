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

  const fetchWikipediaDescription = async (title) => {
  try {
    const response = await axios.get(
      'https://en.wikipedia.org/w/api.php',
      {
        params: {
          action: 'query',
          format: 'json',
          prop: 'extracts',
          titles: title,
          exintro: true, // Fetch only the introductory part
          explaintext: true, // Get plain text without HTML
          origin: '*', // Enable CORS
        },
      }
    );

    // Extract page information
    const pages = response.data.query?.pages || {};
    const pageKey = Object.keys(pages)[0];
    const page = pages[pageKey];

    // Handle missing description or page
    if (pageKey === '-1' || !page?.extract) {
      setWikipediaDescription('No description available for this location on Wikipedia.');
    } else {
      setWikipediaDescription(page.extract);
    }
  } catch (error) {
    console.error('Error fetching Wikipedia description:', error);
    setWikipediaDescription('Failed to fetch description. Please try again later.');
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
      </ScrollView>
      {selectedAttraction && (
  <TouchableOpacity
    style={styles.saveButton}
    onPress={async () => {
      try {
        await axios.post('https://ade3-2401-4900-619b-b023-10d1-321a-a9e9-e77e.ngrok-free.app/saveAttraction', {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 50,
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
    marginBottom: 50, // Ensure scrollable content doesn't cut off
  },
  header: {
    padding: 20,
    backgroundColor: '#8A4DEB', // Green header
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
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
  icon: {
    marginHorizontal: 10,
    color: '#6c757d', // Subtle gray
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#495057', // Darker text
  },
  listItem: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  listItemText: {
    fontSize: 16,
    color: '#212529',
  },
  backButton: {
    margin: 17,
    padding: 10,
    borderRadius: 15,
    marginLeft: 1,
    
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 10,
    color: '#343a40',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
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
    fontWeight: 'bold',
    marginTop: 10,
    color: '#4CAF50',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: Dimensions.get('window').width,
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
  nearbyContainer: {
    flex: 1,
    padding: 10,
  },
  rating: {
    fontSize: 16,
    color: '#ffc107', // Gold color for ratings
    marginHorizontal: 10,
  },
  website: {
    fontSize: 16,
    color: '#007bff', // Link blue
    marginHorizontal: 10,
    textDecorationLine: 'underline',
  },
  saveButton: {
  backgroundColor: '#4CAF50',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignSelf: 'center',
  marginVertical: 20,
},
saveButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginVertical: 20,
},
navigateButton: {
  backgroundColor: '#007bff', // Blue color for the navigate button
  paddingVertical: 12,
  paddingHorizontal: 20,
  marginBottom: 30,
  borderRadius: 8,
  alignSelf: 'center',
},
navigateButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},

});
 