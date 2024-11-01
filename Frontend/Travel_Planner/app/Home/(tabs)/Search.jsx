import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* Search Bar */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Search</Text>
        </View>
        <View style={styles.searchBox}>
          <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
          <TextInput placeholder="Where to?" style={styles.searchInput} />
        </View>

        {/* Rewards Section */}
        <View style={styles.rewardsContainer}>
          <FontAwesome name="dollar" size={30} color="orange" style={styles.rewardsIcon} />
          <Text style={styles.rewardsTitle}>Earn rewards on hotels booked directly in-app</Text>
          <Text style={styles.rewardsDescription}>
            Choose from a wide selection of hotels to book in our app and get 5% back in Tripadvisor Rewards on each stay.
          </Text>
          <TouchableOpacity style={styles.searchHotelsButton}>
            <Text style={styles.searchHotelsButtonText}>Search Hotels</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Experiences Section */}
        <Text style={styles.nearbyTitle}>Nearby experiences</Text>
        <ScrollView horizontal style={styles.experiencesScroll}>
          <View style={styles.experienceCard}>
            <Image source={{ uri: 'https://placekitten.com/200/300' }} style={styles.experienceImage} />
            <TouchableOpacity style={styles.heartIcon}>
              <FontAwesome name="heart-o" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.experienceText}>Oceania, Seabourn and...</Text>
          </View>
          <View style={styles.experienceCard}>
            <Image source={{ uri: 'https://placekitten.com/200/300' }} style={styles.experienceImage} />
            <TouchableOpacity style={styles.heartIcon}>
              <FontAwesome name="heart-o" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.experienceText}>Mangalore Shore...</Text>
          </View>
        </ScrollView>
      </ScrollView>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flexGrow: 1 },
  header: { paddingTop: 40, paddingHorizontal: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#f2f2f2',
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16 },
  rewardsContainer: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardsIcon: { marginBottom: 10 },
  rewardsTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  rewardsDescription: { fontSize: 14, color: 'gray', textAlign: 'center', marginBottom: 20 },
  searchHotelsButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  searchHotelsButtonText: { color: '#fff', fontSize: 16 },
  nearbyTitle: { marginHorizontal: 20, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  experiencesScroll: { paddingHorizontal: 20 },
  experienceCard: {
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    width: 160,
  },
 
});
