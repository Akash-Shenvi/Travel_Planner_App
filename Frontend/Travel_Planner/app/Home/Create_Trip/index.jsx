import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Saves');
  const navigation = useNavigation();
  const router = useRouter();

  
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>joylan</Text>
          <TouchableOpacity style={styles.inviteButton}>
            <Ionicons name="person-add-outline" size={14} color="black" />
            <Text style={styles.inviteText}>Invite</Text>
          </TouchableOpacity>
        </View>
        <Ionicons name="settings-outline" size={24} color="black" />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Saves')}>
          <Text style={[styles.tabText, activeTab === 'Saves' && styles.activeTab]}>Saves</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Itinerary')}>
          <Text style={[styles.tabText, activeTab === 'Itinerary' && styles.activeTab]}>Itinerary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Text style={styles.moreText}>More</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'Saves' ? (
          <View style={styles.emptyContent}>
            <Text style={styles.itemCount}>0 items</Text>
            <Text style={styles.description}>
              Start saving places to see, stay, and eat at on your next trip.
            </Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Start Exploring</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContent}>
            <Text style={styles.itemCount}>No itinerary items</Text>
            <Text style={styles.description}>
              Start planning your itinerary to make the most of your trip.
            </Text>
            <TouchableOpacity style={styles.exploreButton}>
              <Text style={styles.exploreButtonText}>Plan Itinerary</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={24} color="black" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity>
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
    backgroundColor: 'white',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 80,
  },
  profileDetails: {
    
    alignItems: 'center',
  },
  profileName: {
    marginTop:30,
    fontSize: 24,
    fontWeight: 'bold',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E1FF',
    borderRadius: 20,
    padding: 6,
    marginTop: 5,
  },
  inviteText: {
    marginLeft: 4,
    fontSize: 12,
    color: 'black',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: 'gray',
  },
  activeTab: {
    color: 'black',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: 'black',
    paddingBottom: 5,
  },
  moreButton: {
    backgroundColor: 'black',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  moreText: {
    color: 'white',
    fontSize: 14,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  itemCount: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  exploreButtonText: {
    fontSize: 16,
    color: 'black',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: 'black',
  },
});
