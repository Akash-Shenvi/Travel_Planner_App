import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import CalendarPicker from "react-native-calendar-picker";

const TravelDates = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      <Text style={styles.headerText}>Travel Dates</Text>
      
      {/* Add content here */}
      <View style={{
        marginTop:30
      }}>
        <CalendarPicker
         onDateChange={this.onDateChange} 
         allowRangeSelection={true}
         minDate={new Date()}
         maxRangeDuration={30}
         selectedRangeStyle={{
            backgroundColor:'black'
         }}
         selectedDayTextColor={{
            color:'white'
         }}
         />
      </View>
      <TouchableOpacity style={styles.continueButton} onPress={() => router.push('Home/Ai_Trip/SelectDate')}>
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
