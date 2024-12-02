import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TravelersScreen() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customTravelers, setCustomTravelers] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams(); // Retrieve data from the previous screen

  // Log the params when the component is rendered
  useEffect(() => {
    console.log('Received Params:', params);
  }, [params]);

  const travelOptions = [
    {
      id: '1',
      title: 'Just Me',
      description: 'A sole traveler in exploration',
      icon: require('../../../assets/images/plane.png'),
    },
    {
      id: '2',
      title: 'A Couple',
      description: 'Two travelers in tandem',
      icon: require('../../../assets/images/couple.png'),
    },
    {
      id: '3',
      title: 'Family',
      description: 'A group of fun-loving adventurers',
      icon: require('../../../assets/images/family.png'),
    },
    {
      id: '4',
      title: 'Friends',
      description: 'A bunch of thrill-seekers',
      icon: require('../../../assets/images/friends.png'),
    },
  ];

  const handleOptionSelect = (option) => {
    setSelectedOption(option.id);
    if (option.id !== '3' && option.id !== '4') {
      setCustomTravelers(''); // Reset custom traveler input for other options
    }
  };

  const handleContinue = () => {
  if (selectedOption) {
    const selectedData = travelOptions.find((o) => o.id === selectedOption);
    const selectedInfo = {
      title: selectedData.title,
      description: selectedData.description,
      customTravelers:
        selectedOption === '3' || selectedOption === '4'
          ? customTravelers
          : null,
    };

    console.log('Travelers Screen Data:', selectedInfo);

    // Navigate to the next page and pass all relevant data
    router.push({
      pathname: 'Home/Ai_Trip/SelectDate', // Adjust to match your actual route
      params: {
        ...params, // Pass existing params (placeName, location, etc.)
        ...selectedInfo, // Add travelers info
      },
    });
  } else {
    console.log('No option selected');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Who's Traveling</Text>
      <Text style={styles.subheading}>Choose your travelers</Text>

      <FlatList
        data={travelOptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={[
                styles.optionContainer,
                selectedOption === item.id && styles.selectedOption,
              ]}
              onPress={() => handleOptionSelect(item)}
            >
              <Image source={item.icon} style={styles.optionIcon} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{item.title}</Text>
                <Text style={styles.optionDescription}>{item.description}</Text>
              </View>
            </TouchableOpacity>

            {/* Show input only for "Family" and "Friends" */}
            {(selectedOption === '3' || selectedOption === '4') &&
              selectedOption === item.id && (
                <TextInput
                  style={styles.customInput}
                  placeholder="Enter number of travelers"
                  keyboardType="numeric"
                  value={customTravelers}
                  onChangeText={setCustomTravelers}
                />
              )}
          </View>
        )}
      />

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#000',
  },
  optionIcon: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  customInput: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  continueButton: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
