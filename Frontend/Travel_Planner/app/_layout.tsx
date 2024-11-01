import { useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
import { CreateTripContext } from '../context/CreateTripContext';

export default function RootLayout() {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    outfit: require('./../assets/fonts/Outfit-Regular.ttf'),
    'outfit-Medium': require('./../assets/fonts/Outfit-Medium.ttf'),
    'outfit-Bold': require('./../assets/fonts/Outfit-Bold.ttf'),
  });

  // Show a loading spinner until the fonts are loaded
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Trip data state with an empty array


  return (
    
      <Stack>
        <Stack.Screen name="(tabs)" />
      </Stack>
    
  );
}
