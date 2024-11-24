import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function Explore() {
  const navigation = useNavigation();
  const router = useRouter();

  const [places] = useState([
    {
      id: 1,
      name: 'Mysore Palace',
      vicinity: 'Mysore, Karnataka',
      image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Mysore_Palace_in_the_evening.jpg',
    },
    {
      id: 2,
      name: 'Taj Mahal',
      vicinity: 'Agra, Uttar Pradesh',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Taj_Mahal_in_March_2004.jpg/1200px-Taj_Mahal_in_March_2004.jpg',
    },
    {
      id: 3,
      name: 'Hampi',
      vicinity: 'Hampi, Karnataka',
      image: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Hampi_virupaksha_temple.jpg',
    },
    {
      id: 4,
      name: 'Ayodhya',
      vicinity: 'Ayodhya, Uttar Pradesh',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Sarayu_river_Ayodhya.jpg',
    },
    {
      id: 5,
      name: 'Jaipur City Palace',
      vicinity: 'Jaipur, Rajasthan',
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Chandra_Mahal_and_Mubarak_Mahal_%28City_Palace%29.jpg',
    },
    {
      id: 6,
      name: 'Gateway of India',
      vicinity: 'Mumbai, Maharashtra',
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/The_Gateway_of_India.jpg',
    },
  ]);

  // Render tourist places
  const renderTouristPlaces = () => {
    return places.map((place) => (
      <TouchableOpacity
        key={place.id}
        style={styles.destinationCard}
        onPress={() => router.push({ pathname: 'Home/PlaceDetails', params: { placeId: place.id } })}
      >
        <Image
          source={{ uri: place.image }}
          style={styles.destinationImage}
        />
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
});
