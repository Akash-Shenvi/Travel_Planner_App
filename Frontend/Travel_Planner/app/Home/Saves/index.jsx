import React, {  useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
const ExploreButtons = () => {
    const navigation = useNavigation();
    const router = useRouter();
    useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  return (
    
    <View style={styles.container}>
      <Text style={styles.header}>Explore</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() =>router.push('/Home/Saves/SavedPlace') }>
          <Text style={styles.buttonText}>Saved Places</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/Home/Saves/Savedhotels') }>
          <Text style={styles.buttonText}>Hotels</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/Home/Saves/Savedresto') }>
          <Text style={styles.buttonText}>Restaurants</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textShadowColor: '#aaa',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Cochin', // Use a stylish font
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#4DB6AC',  // Green color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,  // For Android
    transform: [{ translateY: 2 }], // Slightly raised effect
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Cochin', // Use a stylish font
  },
});

export default ExploreButtons;
