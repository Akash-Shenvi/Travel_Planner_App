import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect } from 'react';

export default function Explore() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
        <TouchableOpacity style={styles.categoryButton}>
          <Ionicons name="bed-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Hotels</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Ionicons name="ticket-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Things to do</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Ionicons name="restaurant-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryButton}>
          <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
          <Text style={styles.categoryText}>Forums</Text>
        </TouchableOpacity>
      </View>

      {/* Location Prompt */}
      <View style={styles.locationPrompt}>
        <Image source={{ uri: "https://example.com/location-image.jpg" }} style={styles.locationImage} />
        <Text style={styles.locationText}>Looking for something nearby?</Text>
        <Text style={styles.locationSubText}>Mangalore, India</Text>
        <Ionicons name="arrow-forward-outline" size={24} color="black" style={styles.locationArrow} />
      </View>

      {/* Destination Carousel */}
      <Text style={styles.sectionTitle}>Plan your next adventure</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        <View style={styles.destinationCard}>
          <Image source={{ uri: "https://media.istockphoto.com/id/2169486695/photo/goa-gajah-temple-in-ubud-bali-indonesia.jpg?s=612x612&w=0&k=20&c=Epvosx8NWMb_QPHx84F-0f38_LCGKhTOO2X9MuIWpN0=" }} style={styles.destinationImage} />
          <Text style={styles.destinationTitle}>Bali</Text>
          <Text style={styles.destinationSubtitle}>Indonesia</Text>
        </View>
        <View style={styles.destinationCard}>
          <Text style={styles.destinationTitle}>Siena</Text>
          <Text style={styles.destinationSubtitle}>Italy</Text>
        </View>
      </ScrollView>
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
  locationPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F0F0F0',
    margin: 15,
    borderRadius: 10,
  },
  locationImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  locationText: {
    fontFamily: 'outfit',
    fontSize: 16,
    flex: 1,
  },
  locationSubText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: 'gray',
  },
  locationArrow: {
    marginLeft: 5,
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
});
