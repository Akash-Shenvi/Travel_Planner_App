import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function PlanTrip() {
  const navigation = useNavigation();
  const [tripName, setTripName] = useState('');

  const handleCreateTrip = () => {
    if (tripName) {
      navigation.navigate('TripDetails', { tripName });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create a Trip</Text>
      <Text style={styles.label}>Trip name</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Weekend in NYC"
        value={tripName}
        onChangeText={setTripName}
      />
      <TouchableOpacity
        style={[styles.createButton, !tripName && styles.disabledButton]}
        onPress={handleCreateTrip}
        disabled={!tripName}
      >
        <Text style={styles.buttonText}>Create a Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: 'gray',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: 'black',
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
