import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Animated, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';

export default function Explore() {
  const navigation = useNavigation();
  const router = useRouter();

  const [profileVisible, setProfileVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-500)).current;
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [instagram, setInstagram] = useState('');
  const [gender, setGender] = useState('');

  const toggleProfile = () => {
    setProfileVisible(!profileVisible);
    Animated.timing(slideAnim, {
      toValue: profileVisible ? -500 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Explore</Text>
        <TouchableOpacity onPress={toggleProfile}>
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

      {/* Profile Slide-In Panel */}
      <Animated.View style={[styles.profileContainer, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.profileContent}>
          <Image source={{ uri: "https://example.com/profile-pic.jpg" }} style={styles.profilePic} />
          <Text style={styles.emailText}>{email}</Text>

          <Text style={styles.label}>Name</Text>
          <Text style={styles.nonEditableText}>{name}</Text>

          <Text style={styles.label}>Short bio</Text>
          <TextInput style={styles.input} placeholder="Tell us a bit about yourself" value={bio} onChangeText={setBio} />

          <Text style={styles.label}>Home city</Text>
          <TextInput style={styles.input} placeholder="Enter your city" value={city} onChangeText={setCity} />

          <Text style={styles.label}>Date of birth</Text>
          <TextInput style={styles.input} placeholder="DD / MM / YYYY" value={dob} onChangeText={setDob} keyboardType="numeric" />

          <Text style={styles.label}>Instagram</Text>
          <TextInput style={styles.input} placeholder="Paste your profile link" value={instagram} onChangeText={setInstagram} />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            {['Male', 'Female', 'Other'].map((option) => (
              <TouchableOpacity key={option} style={styles.genderOption} onPress={() => setGender(option)}>
                <Ionicons name={gender === option ? 'radio-button-on' : 'radio-button-off'} size={18} color="black" />
                <Text style={styles.genderText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleProfile} style={styles.closeButton}>
            <Ionicons name="close-circle-outline" size={30} color="black" />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
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
  profileContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 100,
    paddingTop: 50,
  },
  profileContent: {
    padding: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 15,
  },
  emailText: {
    fontFamily: 'outfit',
    fontSize: 16,
    textAlign: 'center',
    color: 'gray',
    marginBottom: 20,
  },
  label: {
    fontFamily: 'outfit-Bold',
    fontSize: 14,
    marginVertical: 5,
  },
  nonEditableText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: 'gray',
  },
  input: {
    fontFamily: 'outfit',
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
    paddingVertical: 5,
    marginBottom: 15,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderText: {
    fontFamily: 'outfit',
    fontSize: 14,
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontFamily: 'outfit-Bold',
    fontSize: 16,
  },
  closeButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  
});
