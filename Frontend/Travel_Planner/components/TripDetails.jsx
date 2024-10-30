import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

export default function TripDetails({ route }) {
  const { tripName } = route.params;
  const [days, setDays] = useState('');
  const [savedItems, setSavedItems] = useState([
    { id: 1, name: 'Saved Location 1' },
    { id: 2, name: 'Saved Location 2' },
  ]); // Example saved items
  const [addedItems, setAddedItems] = useState([]);

  const handleAddItem = (item) => {
    if (!addedItems.includes(item)) {
      setAddedItems([...addedItems, item]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip to {tripName}</Text>
      <Text style={styles.label}>Number of Days</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter number of days"
        value={days}
        onChangeText={setDays}
        keyboardType="numeric"
      />

      <Text style={styles.subHeader}>Saved Items</Text>
      <ScrollView>
        {savedItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemButton}
            onPress={() => handleAddItem(item)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.subHeader}>Trip Itinerary</Text>
      {addedItems.length > 0 ? (
        addedItems.map((item) => (
          <Text key={item.id} style={styles.itemText}>
            {item.name}
          </Text>
        ))
      ) : (
        <Text style={styles.emptyText}>No items added yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  itemButton: {
    padding: 10,
    backgroundColor: '#E6E1FF',
    borderRadius: 5,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 16,
  },
  emptyText: {
    color: 'gray',
    fontStyle: 'italic',
  },
});
