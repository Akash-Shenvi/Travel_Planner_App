import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,TextInput, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function Plan() {
  const navigation = useNavigation();
  const router = useRouter();

  const [isCreateTripVisible, setIsCreateTripVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current; // Initial position below the screen

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Function to handle the slide-up animation
  const openCreateTrip = () => {
    setIsCreateTripVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const closeCreateTrip = () => {
    Animated.timing(slideAnim, {
      toValue: 600, // Slide back down
      duration: 500,
      useNativeDriver: true,
    }).start(() => setIsCreateTripVisible(false));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.headerText}>Get to know Trips</Text>
      <Text style={styles.subHeaderText}>
        Now there’s two ways to plan your trip—use AI or search on your own.
      </Text>

      {/* Options List */}
      <ScrollView contentContainerStyle={styles.optionsList}>
        <View style={styles.optionItem}>
          <Ionicons name="location-outline" size={24} color="black" />
          <Text style={styles.optionText}>Get personalized recs with AI</Text>
        </View>
        <View style={styles.optionItem}>
          <Ionicons name="heart-outline" size={24} color="black" />
          <Text style={styles.optionText}>Save hotels, restaurants, and more</Text>
        </View>
        <View style={styles.optionItem}>
          <Ionicons name="map-outline" size={24} color="black" />
          <Text style={styles.optionText}>See your saves on your custom map</Text>
        </View>
        <View style={styles.optionItem}>
          <Ionicons name="people-outline" size={24} color="black" />
          <Text style={styles.optionText}>Share and collab with your travel buds</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <TouchableOpacity onPress={openCreateTrip} style={styles.createTripButton}>
        <Ionicons name="add-outline" size={18} color="white" />
        <Text style={styles.createTripText}>Create a Trip</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buildTripButton} onPress={() => router.push('/Home/Ai_Trip')}>
        <Ionicons name="compass-outline" size={18} color="#8A4DEB" />
        <Text style={styles.buildTripText}>Build a trip with AI</Text>
      </TouchableOpacity>

      {/* Slide-up Create Trip screen */}
      {isCreateTripVisible && (
        <Animated.View style={[styles.createTripContainer, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity onPress={closeCreateTrip}>
            <Ionicons name="close-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.createTripScreenHeader}>Create a Trip</Text>
          <Text>Trip name</Text>
          <TextInput placeholder="Ex: Weekend in NYC" style={styles.input} />
          <TouchableOpacity style={styles.confirmButton}
          onPress={() => router.push('/Home/Create_Trip')}>
            <Text style={styles.confirmButtonText}>Create a Trip</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/Home')}>
          <Ionicons name="home-outline" size={24} color="black" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Home/Search')}>
          <Ionicons name="search-outline" size={24} color="black" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color="black" />
          <Text style={styles.navText}>Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="pencil-outline" size={24} color="black" />
          <Text style={styles.navText}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person-outline" size={24} color="black" />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'outfit-Bold',
    marginBottom: 20,
    marginTop: 20,
  },
  subHeaderText: {
    fontSize: 14,
    fontFamily: 'outfit',
    color: 'gray',
    marginBottom: 50,
  },
  optionsList: {
    marginBottom: 30,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionText: {
    fontFamily: 'outfit',
    fontSize: 16,
    marginLeft: 10,
  },
  createTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 100,
    marginBottom: 10,
  },
  createTripText: {
    color: 'white',
    fontFamily: 'outfit-Bold',
    fontSize: 16,
    marginLeft: 5,
  },
  buildTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E1FF',
    paddingVertical: 15,
    borderRadius: 100,
    marginBottom: 200,
  },
  buildTripText: {
    color: '#8A4DEB',
    fontFamily: 'outfit-Bold',
    fontSize: 16,
    marginLeft: 5,
  },
    createTripContainer: {
    position: 'absolute',
    bottom: 100, // Increase this to bring it up higher
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30, // Added padding for spacing
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  createTripScreenHeader: {
    fontSize: 24,
    fontFamily: 'outfit-Bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: 'gray',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'outfit-Bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navText: {
    fontFamily: 'outfit',
    fontSize: 12,
    marginTop: 5,
    color: 'black',
  },
});
