import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Animated, ScrollView } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
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
          <Image source={{ uri: "data:image/jpeg;base64,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" }} style={styles.destinationImage} />
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

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Ionicons name="home-outline" size={24} color="black" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Home/Search')}>
          <Ionicons name="search-outline" size={24} color="black" />
          <Text style={styles.navText}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/Home/Plan')}>
          <Ionicons name="heart-outline" size={24} color="black" />
          <Text style={styles.navText}>Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="pencil-outline" size={24} color="black" />
          <Text style={styles.navText}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleProfile}>
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
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#F5F5F5',
  },
  navText: {
    fontFamily: 'outfit',
    fontSize: 12,
    marginTop: 5,
  },
});
