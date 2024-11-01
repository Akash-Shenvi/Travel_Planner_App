import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function _layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 70,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: 15,
          backgroundColor: '#fff',
          elevation: 5, // For Android shadow
          shadowColor: '#000', // For iOS shadow
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 6.27,
        },
        tabBarLabelStyle: {
          fontSize: 14,
        },
        tabBarIcon: ({ focused }) => {
          let iconName;
          let color = focused ? '#D8BFD8' : '#000'; // Light purple when focused
          let size = focused ? 28 : 24; // Larger when focused

          if (route.name === 'Explore') {
            iconName = 'home-outline';
          } else if (route.name === 'Search') {
            iconName = 'search-outline';
          } else if (route.name === 'Plan') {
            iconName = 'heart-outline';
          } else if (route.name === 'Bookings') {
            iconName = 'calendar-outline'; // Bookings icon
          } else if (route.name === 'Account') {
            iconName = 'person-outline'; // Account icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Explore" />
      <Tabs.Screen name="Search" />
      <Tabs.Screen name="Plan" />
      <Tabs.Screen name="Bookings" />
      <Tabs.Screen name="Account" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6.27,
  },
  tabBarLabel: {
    fontSize: 14,
  },
});
