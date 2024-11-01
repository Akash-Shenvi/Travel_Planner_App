import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native'; // Added Image import
import React, { useEffect } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { useFonts } from 'expo-font'; // Import useFonts to load custom fonts
import AppLoading from 'expo-app-loading'; // Import AppLoading for handling loading state

export default function Login() {
  const [fontsLoaded] = useFonts({
    'outfit-Bold': require('./../assets/fonts/Outfit-Bold.ttf'),
    'outfit-M': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-R': require('./../assets/fonts/Outfit-Regular.ttf'),
  });

  const navigation = useNavigation();
  const router = useRouter(); // Remove the duplicate router declaration

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Handle loading state for fonts
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
          marginTop: 30, // Corrected the fontFamily
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
          onPress={() => router.push('auth/sign-in')}
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
