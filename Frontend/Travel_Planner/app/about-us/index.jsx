import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AboutUs = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Disable header
    });
  }, [navigation]);

  const handleEmailPress = () => {
    Linking.openURL('mailto:aacmovies906@gmail.com');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#2A2A72" />
      </TouchableOpacity>

      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100' }} // Replace with your app logo URL
          style={styles.logo}
        />
      </View>
      
      {/* App Name and Purpose */}
      <Text style={styles.heading}>Travel Planner App</Text>
      <Text style={styles.description}>
        Your ultimate companion for planning stress-free and memorable journeys.
        From creating itineraries to exploring destinations, we've got you covered.
      </Text>
      
      {/* Mission Statement */}
      <Text style={styles.subHeading}>Our Mission</Text>
      <Text style={styles.description}>
        To make travel planning seamless, inspiring, and accessible for everyone, 
        enabling you to explore the world with confidence.
      </Text>

      {/* Features */}
      <Text style={styles.subHeading}>Key Features</Text>
      <Text style={styles.description}>
        - Plan trips effortlessly with a 5-day itinerary generator.{'\n'}
        - Save and organize attractions, restaurants, and hotels.{'\n'}
        - Set travel dates, budgets, and more tailored to your needs.{'\n'}
        - Experience a user-friendly and personalized interface.
      </Text>

      {/* Developer Info */}
      <Text style={styles.subHeading}>About the Developer</Text>
      <Text style={styles.description}>
        Built by [Your Name], a Computer Science and Engineering student at 
        Canara Engineering College, Mangalore. Passionate about merging technology and travel.
      </Text>

      {/* Contact */}
      <Text style={styles.subHeading}>Contact Us</Text>
      <Text style={styles.description}>
        Have feedback or need support?{' '}
        <Text style={styles.link} onPress={handleEmailPress}>
          Reach out to us at aacmovies906@gmail.com.
        </Text>
      </Text>
            {/* Copyright */}
      <Text style={styles.copyright}>
        © 2024 Travel Planner App. All rights reserved.
      </Text>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2A2A72',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  link: {
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
    copyright: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

});

export default AboutUs;
