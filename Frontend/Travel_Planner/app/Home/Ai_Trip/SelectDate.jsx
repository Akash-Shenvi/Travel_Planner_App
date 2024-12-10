import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';
import CalendarPicker from 'react-native-calendar-picker';
import { useLocalSearchParams } from 'expo-router';

const TravelDates = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation(); // Retrieve params from the previous screen

  useEffect(() => {
        navigation.setOptions({
      headerShown: true,
      headerTransparent:true,
      headerTitle:'',  // Hides the back button label (if any)
 

    });
    console.log('Received Params:', params);
  }, [params]);

  const onDateChange = (date, type) => {
    if (type === 'START_DATE') {
      setStartDate(date); // Update start date
      setEndDate(null); // Reset end date if a new start date is selected
    } else if (type === 'END_DATE') {
      setEndDate(date); // Update end date
    }
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start); // Difference in milliseconds
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Convert to days
      return diffDays;
    }
    return 0;
  };

  const handleContinue = () => {
  if (!startDate || !endDate) {
    Alert.alert('Error', 'Please select a date range.');
    return;
  }

  const totalDays = calculateDays();
  console.log('Selected Dates:');
  console.log('Start Date:', startDate ? startDate.toString() : 'Not selected');
  console.log('End Date:', endDate ? endDate.toString() : 'Not selected');
  console.log('Number of Days:', totalDays);

  // Navigate to the next screen and pass all relevant data
  router.push({
    pathname: 'Home/Ai_Trip/budget', // Replace with the correct next route
    params: {
      ...params, // Pass existing location and travel info
      startDate: startDate.toISOString(), // Pass start date
      endDate: endDate.toISOString(), // Pass end date
      totalDays, // Pass total days
    },
  });
};


  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Travel Dates</Text>
      <Text style={styles.subHeaderText}>
        Location: {params.name || 'Unknown'}
      </Text>
      <Text style={styles.subHeaderText}>
        Travelers: {params.title || 'Unknown'}
      </Text>

      <View style={{ marginTop: 30 }}>
        <CalendarPicker
          onDateChange={onDateChange}
          allowRangeSelection={true}
          minDate={new Date()}
          maxRangeDuration={30}
          selectedRangeStyle={{
            backgroundColor: 'black',
          }}
          selectedDayTextColor="white"
        />
      </View>

      {startDate && endDate && (
        <Text style={styles.rangeText}>
          You have selected a range of {calculateDays()} days.
        </Text>
      )}

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 60,
    fontFamily: 'Outfit', // Custom font you mentioned earlier
    color: 'black',
     
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    fontFamily: 'Outfit',
  },
  rangeText: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: 'black',
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

export default TravelDates;
