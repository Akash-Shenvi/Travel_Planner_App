import React, { useEffect, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
   Linking ,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const GOOGLE_API_KEY = 'AlzaSyIc0rhqLEr8qYNwgzueZwh22QJZL7yQ-iH'; // Replace with your actual API key

const SavedAttractionsScreen = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    fetchAttractions();
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchAttractions = async () => {
    try {
      const response = await axios.post(
        'http://192.168.27.138:5000/getresturants',
        {},
        {
          withCredentials: true, // Ensure cookies/session are sent
        }
      );

      if (response.status === 200) {
        const data = await Promise.all(
          response.data.attractions.map(async (attraction) => {
            const address = await fetchAddress(attraction.latitude, attraction.longitude);
            return { ...attraction, address };
          })
        );
        setAttractions(data);
      } else {
        Alert.alert('Error', 'Failed to fetch restuarants.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      if (!latitude || !longitude) return 'Coordinates not available';
      const geocodeUrl = `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
      const response = await axios.get(geocodeUrl);
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address || 'Address not available';
      }
      return 'Address not found';
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Error fetching address';
    }
  };

  const deleteAttraction = async (name) => {
    try {
      const response = await axios.post(
        'http://192.168.27.138:5000/deleteresto',
        { name },
        { withCredentials: true }
      );
      if (response.status === 200) {
        Alert.alert('Success', 'Restuarant deleted successfully.');
        setAttractions(attractions.filter((item) => item.name !== name));
      } else {
        Alert.alert('Error', response.data.error || 'Failed to delete attraction.');
      }
    } catch (error) {
      console.error('Error deleting restuarant:', error);
      Alert.alert('Error', 'An error occurred while deleting the attraction.');
    }
  };
    const addPlaceToAnotherList = async (name,placeType) => {
  try {
    const response = await axios.post(
      'http://192.168.27.138:5000/add_place',
      { name, place_type: placeType }, // Use lowercase 'name'
      { withCredentials: true }
    );
    
    return response.status === 201;
  } catch (error) {
    console.error('Error adding place to another list:', error);
    throw error;
  }
};

  const renderAttraction = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.title}>{item.name}</Text>
      <View style={styles.iconRow}>
        <TouchableOpacity
          onPress={() => {
            if (item.latitude && item.longitude) {
              const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
              Linking.openURL(navigationUrl);
            } else if (item.address) {
              const navigationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`;
              Linking.openURL(navigationUrl);
            } else {
              Alert.alert('Error', 'Location information not available');
            }
          }}
        >
          <MaterialIcons name="navigation" size={24} color="#007aff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteAttraction(item.name)}>
          <MaterialIcons name="delete" size={24} color="#f00" />
        </TouchableOpacity>
           <TouchableOpacity
            onPress={async () => {
              try {
                const response = await addPlaceToAnotherList(item.name, 'restaurant', 'saved');
                if (response) {
                  Alert.alert('Success', 'Place added successfully.');
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to add place.');
              }
            }}
          >
            <MaterialIcons name="add-circle-outline" size={24} color="#4caf50" />
          </TouchableOpacity>
      </View>
    </View>
    <Image source={{ uri: item.photo }} style={styles.image} />
    <View style={styles.cardContent}>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.location}>Address: {item.address}</Text>
    </View>
  </View>
);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Saved Restuarants</Text>
      {attractions.length > 0 ? (
        <FlatList
          data={attractions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderAttraction}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No saved restuarants found.</Text>
      )}
    </View>
  );
};

export default SavedAttractionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  list: {
    paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
