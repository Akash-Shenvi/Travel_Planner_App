import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native'; 
import React, { useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { useFonts } from 'expo-font'; 
import AppLoading from 'expo-app-loading'; 

export default function Login() {
  const [fontsLoaded] = useFonts({
    'outfit-Bold': require('./../assets/fonts/Outfit-Bold.ttf'),
    'outfit-M': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-R': require('./../assets/fonts/Outfit-Regular.ttf'),
  });

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    // Check session
    fetch('https://sunbeam-pet-octopus.ngrok-free.app/check-session', {
      method: 'GET',
      credentials: 'include', // Ensure cookies are sent with the request
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.session) {
          router.replace('/Home'); // Navigate to home page if session exists
        } 
      })
      .catch((error) => console.error('Error checking session:', error));
  }, [navigation, router]);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View>
      <Image 
        source={require('./../assets/images/login.png')}
        style={{
          width: '100%',
          height: 520,
        }} 
      />
      <View style={styles.container}>
        <Text style={{
          fontSize: 28,
          fontFamily: 'outfit-Bold',
          textAlign: 'center',
          marginTop: 30,
        }}>
          Ai Travel Planner
        </Text>
        <Text style={{
          fontSize: 17,
          fontFamily: 'outfit-M',
          textAlign: 'center',
          color: 'gray',
          marginTop: 30,
        }}>
          Discover your next adventure effortlessly. Personalized itineraries at your fingertips. Travel smarter with AI-driven insights.
        </Text>
      
        <TouchableOpacity 
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={styles.button}>
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white', 
    marginTop: -20,
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 15,
    fontFamily: 'outfit-R',
  },
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 99,
    color: 'white',
    textAlign: 'center',
    fontFamily: 'outfit-R',
    marginTop: 70,
    fontSize: 18,
  },
});
