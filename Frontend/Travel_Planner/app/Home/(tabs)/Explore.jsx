import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function Explore() {
  const navigation = useNavigation();
  const router = useRouter();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Google Places API
    const fetchPlaces = async () => {
      try {
        const response = await fetch(
          'https://maps.gomaps.pro/maps/api/place/textsearch/json?query=famous+tourist+places+in+India&key=AlzaSyK_RnNNH0BPrM4WAnfvh-zfqkjeBbZP27I'
        );
        const data = await response.json();
        if (data.results) {
          const formattedPlaces = data.results.map((place) => ({
            id: place.place_id,
            name: place.name,
            vicinity: place.formatted_address,
            image: place.photos
              ? `https://maps.gomaps.pro/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AlzaSygqIOY_J7MphubgL7Ab38R9l4pJCeWU8EC`
              : 'https://via.placeholder.com/400x300.png?text=Image+Not+Available',
            description: place.business_status || 'Description not available',
          }));
          setPlaces(formattedPlaces);
        } else {
          console.error('No results found in the API response:', data);
        }
      } catch (error) {
        console.error('Error fetching places:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Render tourist places
  const renderTouristPlaces = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (places.length === 0) {
      return <Text style={styles.errorText}>No places found.</Text>;
    }

    return places.map((place) => (
      <TouchableOpacity
        key={place.id}
        style={styles.destinationCard}
        onPress={() =>
          router.push({
            pathname: 'Home/PlaceDetails',
            params: {
              placeId: place.id,
              placeName: place.name,
              placeImage: place.image,
              placeDescription: place.description,
            },
          })
        }
      >
        <Image source={{ uri: place.image }} style={styles.destinationImage} />
        <Text style={styles.destinationTitle}>{place.name}</Text>
        <Text style={styles.destinationSubtitle}>{place.vicinity}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Explore</Text>
        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={40} color="black" />
        </TouchableOpacity>
      </View>

      {/* Explore Categories */}
      <View style={styles.categoriesContainer}>
        <TouchableOpacity onPress={() => router.push('Home/Hotels')} style={styles.categoryButton}>
          <Ionicons name="bed-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Hotels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Ionicons name="ticket-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Things to do</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('Home/Restaurants')} style={styles.categoryButton}>
          <Ionicons name="restaurant-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Forums</Text>
        </TouchableOpacity>
      </View>

      {/* Tourist Places Section */}
      <Text style={styles.sectionTitle}>Famous Tourist Places in India</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {renderTouristPlaces()}
      </ScrollView>

      {/* Chatbot Icon */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => router.push('Home/ChatbotPage')}
      >
        <Ionicons name="chatbubbles" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  headerText: {
    fontSize: 28,
    fontFamily: 'outfit-Bold',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  categoryButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 50,
  },
  categoryText: {
    fontFamily: 'outfit',
    fontSize: 14,
    marginTop: 5,
  },
  sectionTitle: {
    fontFamily: 'outfit-Bold',
    fontSize: 20,
    marginHorizontal: 15,
    marginTop: 15,
  },
  carousel: {
    paddingHorizontal: 15,
  },
  destinationCard: {
    width: 150,
    marginRight: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: 100,
  },
  destinationTitle: {
    fontFamily: 'outfit-Bold',
    fontSize: 16,
    margin: 5,
  },
  destinationSubtitle: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: 'gray',
    marginLeft: 5,
    marginBottom: 5,
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 85,
    right: 20,
    backgroundColor: 'skyblue',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
